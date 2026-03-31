import "server-only";

import Stripe from "stripe";

import {
  BillingStatus,
  EntitlementSourceType,
  EntitlementType,
  OfferType,
  Prisma,
  PurchaseStatus,
  SubscriptionStatus
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { trackEvent } from "@/lib/server/analytics";
import { isFeatureEnabled } from "@/lib/server/feature-flags";
import { notifyUser } from "@/lib/server/notifications";
import {
  type BillingInterval,
  getBillingPortalReturnUrl,
  getCheckoutCancelUrl,
  getCheckoutSuccessUrl,
  getStripe,
  normalizeBillingInterval,
  resolveIntervalForStripePriceId,
  resolvePlanSlugForStripePriceId,
  resolveStripePriceId
} from "@/lib/server/stripe";

function addDays(days: number, from = new Date()) {
  const next = new Date(from);
  next.setDate(next.getDate() + days);
  return next;
}

function stripeTimestampToDate(
  timestamp: number | null | undefined,
  fallback: Date
) {
  return timestamp ? new Date(timestamp * 1000) : fallback;
}

function formatBillingDate(value: Date | null | undefined) {
  return (value ?? new Date()).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function mapStripeSubscriptionStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "active":
    case "trialing":
      return SubscriptionStatus.ACTIVE;
    case "past_due":
    case "unpaid":
      return SubscriptionStatus.PAST_DUE;
    case "incomplete":
      return SubscriptionStatus.INCOMPLETE;
    case "canceled":
    case "incomplete_expired":
    case "paused":
      return SubscriptionStatus.CANCELED;
    default:
      return SubscriptionStatus.INCOMPLETE;
  }
}

function mapStripeBillingStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "active":
    case "trialing":
      return BillingStatus.ACTIVE;
    case "past_due":
    case "incomplete":
      return BillingStatus.GRACE_PERIOD;
    case "unpaid":
      return BillingStatus.READ_ONLY;
    case "canceled":
    case "incomplete_expired":
    case "paused":
      return BillingStatus.CANCELED;
    default:
      return BillingStatus.INACTIVE;
  }
}

async function getPlanBySlug(planSlug: string) {
  const plan = await prisma.plan.findUnique({
    where: { slug: planSlug }
  });

  if (!plan || !plan.isActive) {
    throw new Error("That plan is not available.");
  }

  return plan;
}

async function getLatestLocalSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: {
        in: [
          SubscriptionStatus.ACTIVE,
          SubscriptionStatus.PAST_DUE,
          SubscriptionStatus.INCOMPLETE,
          SubscriptionStatus.CANCELED
        ]
      }
    },
    include: { plan: true },
    orderBy: [{ renewsAt: "desc" }, { createdAt: "desc" }]
  });
}

async function getOrCreateStripeCustomer(params: {
  userId: string;
  email: string;
  existingCustomerId?: string | null;
}) {
  const { userId, email, existingCustomerId } = params;

  if (existingCustomerId) {
    return existingCustomerId;
  }

  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      providerCustomerId: { not: null }
    },
    orderBy: { createdAt: "desc" },
    select: { providerCustomerId: true }
  });

  if (existingSubscription?.providerCustomerId) {
    return existingSubscription.providerCustomerId;
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId
    }
  });

  return customer.id;
}

export async function syncSubscriptionFromStripe(
  stripeSubscription: Stripe.Subscription,
  options?: {
    billingStatus?: BillingStatus;
    eventName?: string;
  }
) {
  const stripeCustomerId =
    typeof stripeSubscription.customer === "string"
      ? stripeSubscription.customer
      : stripeSubscription.customer.id;
  const stripePriceId = stripeSubscription.items.data[0]?.price.id ?? null;
  const existingByProvider = await prisma.subscription.findUnique({
    where: {
      providerSubscriptionId: stripeSubscription.id
    },
    include: { plan: true }
  });

  const fallbackByCustomer = stripeCustomerId
    ? await prisma.subscription.findFirst({
        where: {
          providerCustomerId: stripeCustomerId
        },
        include: { plan: true },
        orderBy: { createdAt: "desc" }
      })
    : null;

  const userId =
    stripeSubscription.metadata.userId ?? existingByProvider?.userId ?? fallbackByCustomer?.userId;

  if (!userId) {
    throw new Error(`Unable to match Stripe subscription ${stripeSubscription.id} to a user.`);
  }

  const planSlug =
    resolvePlanSlugForStripePriceId(stripePriceId) ??
    stripeSubscription.metadata.planSlug ??
    existingByProvider?.plan.slug ??
    fallbackByCustomer?.plan.slug;

  if (!planSlug) {
    throw new Error(`Unable to resolve a plan for Stripe subscription ${stripeSubscription.id}.`);
  }

  const plan = await getPlanBySlug(planSlug);
  const now = new Date();
  const interval =
    resolveIntervalForStripePriceId(stripePriceId) ??
    normalizeBillingInterval(stripeSubscription.metadata.billingInterval);
  const currentItem = stripeSubscription.items.data[0];
  const cycleStart = stripeTimestampToDate(
    currentItem?.current_period_start,
    stripeTimestampToDate(
      stripeSubscription.billing_cycle_anchor,
      stripeTimestampToDate(stripeSubscription.start_date, now)
    )
  );
  const cycleEnd = stripeTimestampToDate(
    currentItem?.current_period_end,
    addDays(interval === "annual" ? 365 : 30, cycleStart)
  );
  const subscriptionStatus = mapStripeSubscriptionStatus(stripeSubscription.status);
  const billingStatus = options?.billingStatus ?? mapStripeBillingStatus(stripeSubscription.status);

  const persistedSubscription = existingByProvider
    ? await prisma.subscription.update({
        where: { id: existingByProvider.id },
        data: {
          userId,
          planId: plan.id,
          status: subscriptionStatus,
          startedAt: stripeTimestampToDate(stripeSubscription.start_date, cycleStart),
          renewsAt: cycleEnd,
          cycleStart,
          cycleEnd,
          canceledAt: stripeSubscription.canceled_at
            ? stripeTimestampToDate(stripeSubscription.canceled_at, cycleEnd)
            : stripeSubscription.cancel_at
              ? stripeTimestampToDate(stripeSubscription.cancel_at, cycleEnd)
              : null,
          providerCustomerId: stripeCustomerId,
          providerSubscriptionId: stripeSubscription.id
        },
        include: { plan: true }
      })
    : await prisma.subscription.create({
        data: {
          userId,
          planId: plan.id,
          status: subscriptionStatus,
          startedAt: stripeTimestampToDate(stripeSubscription.start_date, cycleStart),
          renewsAt: cycleEnd,
          cycleStart,
          cycleEnd,
          canceledAt: stripeSubscription.canceled_at
            ? stripeTimestampToDate(stripeSubscription.canceled_at, cycleEnd)
            : stripeSubscription.cancel_at
              ? stripeTimestampToDate(stripeSubscription.cancel_at, cycleEnd)
              : null,
          providerCustomerId: stripeCustomerId,
          providerSubscriptionId: stripeSubscription.id
        },
        include: { plan: true }
      });

  await prisma.subscription.updateMany({
    where: {
      userId,
      id: { not: persistedSubscription.id },
      status: {
        in: [
          SubscriptionStatus.ACTIVE,
          SubscriptionStatus.PAST_DUE,
          SubscriptionStatus.INCOMPLETE
        ]
      }
    },
    data: {
      status: SubscriptionStatus.CANCELED,
      canceledAt: now
    }
  });

  const existingLedger = await prisma.creditLedger.findFirst({
    where: {
      userId,
      subscriptionId: persistedSubscription.id,
      cycleStart,
      cycleEnd
    }
  });

  if (existingLedger) {
    await prisma.creditLedger.update({
      where: { id: existingLedger.id },
      data: {
        creditsTotal: Math.max(existingLedger.creditsTotal, plan.messageQuota),
        source: `stripe:${plan.slug}:${interval}`
      }
    });
  } else {
    await prisma.creditLedger.create({
      data: {
        userId,
        subscriptionId: persistedSubscription.id,
        cycleStart,
        cycleEnd,
        creditsTotal: plan.messageQuota,
        creditsUsed: 0,
        creditsReserved: 0,
        source: `stripe:${plan.slug}:${interval}`
      }
    });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      billingStatus
    }
  });

  await trackEvent({
    eventName: options?.eventName ?? "stripe_subscription_synced",
    category: "BILLING",
    userId,
    metadata: {
      planSlug: plan.slug,
      subscriptionId: persistedSubscription.id,
      providerSubscriptionId: stripeSubscription.id,
      billingStatus,
      stripeStatus: stripeSubscription.status,
      billingInterval: interval
    }
  });

  return persistedSubscription;
}

export async function createCheckoutSession(params: {
  userId: string;
  email: string;
  planSlug: string;
  billingInterval?: BillingInterval;
}) {
  if (!(await isFeatureEnabled("new_purchases_enabled"))) {
    throw new Error("New purchases are temporarily paused.");
  }

  const stripe = getStripe();
  const billingInterval = normalizeBillingInterval(params.billingInterval);
  const plan = await getPlanBySlug(params.planSlug);
  const targetPriceId = resolveStripePriceId(plan.slug, billingInterval);
  const currentSubscription = await getLatestLocalSubscription(params.userId);

  if (currentSubscription?.providerSubscriptionId) {
    const currentStripeSubscription = await stripe.subscriptions.retrieve(
      currentSubscription.providerSubscriptionId
    );
    const currentItem = currentStripeSubscription.items.data[0];
    const currentPriceId = currentItem?.price.id ?? null;

    if (
      currentPriceId === targetPriceId &&
      !currentStripeSubscription.cancel_at_period_end
    ) {
      return {
        mode: "unchanged" as const,
        subscription: currentSubscription
      };
    }

    if (plan.messageQuota < currentSubscription.plan.messageQuota) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer:
          currentSubscription.providerCustomerId ??
          (await getOrCreateStripeCustomer({
            userId: params.userId,
            email: params.email,
            existingCustomerId: currentSubscription.providerCustomerId
          })),
        return_url: getBillingPortalReturnUrl()
      });

      return {
        mode: "portal" as const,
        redirectUrl: portalSession.url
      };
    }

    if (!currentItem) {
      throw new Error("Current Stripe subscription is missing a price item.");
    }

    const updatedStripeSubscription = await stripe.subscriptions.update(
      currentStripeSubscription.id,
      {
        items: [
          {
            id: currentItem.id,
            price: targetPriceId
          }
        ],
        cancel_at_period_end: false,
        proration_behavior: "create_prorations",
        metadata: {
          userId: params.userId,
          planSlug: plan.slug,
          billingInterval
        }
      }
    );

    const subscription = await syncSubscriptionFromStripe(updatedStripeSubscription, {
      eventName: "subscription_updated"
    });

    await notifyUser({
      userId: params.userId,
      templateKey: "plan_upgraded",
      payload: {
        planName: subscription.plan.name,
        cycleEnd: formatBillingDate(subscription.cycleEnd ?? subscription.renewsAt)
      },
      sendEmail: true
    });

    return {
      mode: "updated" as const,
      subscription
    };
  }

  const customerId = await getOrCreateStripeCustomer({
    userId: params.userId,
    email: params.email,
    existingCustomerId: currentSubscription?.providerCustomerId
  });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: params.userId,
    success_url: getCheckoutSuccessUrl(),
    cancel_url: getCheckoutCancelUrl(plan.slug),
    allow_promotion_codes: true,
    line_items: [
      {
        price: targetPriceId,
        quantity: 1
      }
    ],
    metadata: {
      userId: params.userId,
      planSlug: plan.slug,
      billingInterval
    },
    subscription_data: {
      metadata: {
        userId: params.userId,
        planSlug: plan.slug,
        billingInterval
      }
    }
  });

  await trackEvent({
    eventName: "checkout_session_created",
    category: "BILLING",
    userId: params.userId,
    metadata: {
      planSlug: plan.slug,
      billingInterval,
      sessionId: session.id
    }
  });

  return {
    mode: "checkout" as const,
    redirectUrl: session.url,
    sessionId: session.id
  };
}

export async function createBillingPortalSession(params: {
  userId: string;
  email: string;
}) {
  const stripe = getStripe();
  const currentSubscription = await getLatestLocalSubscription(params.userId);
  const customerId = await getOrCreateStripeCustomer({
    userId: params.userId,
    email: params.email,
    existingCustomerId: currentSubscription?.providerCustomerId
  });
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: getBillingPortalReturnUrl()
  });

  await trackEvent({
    eventName: "billing_portal_opened",
    category: "BILLING",
    userId: params.userId,
    metadata: {
      customerId
    }
  });

  return session;
}

export async function subscribeUserToPlan(
  userId: string,
  email: string,
  planSlug: string,
  billingInterval?: BillingInterval
) {
  return createCheckoutSession({
    userId,
    email,
    planSlug,
    billingInterval
  });
}

export async function cancelSubscription(userId: string, subscriptionId?: string) {
  const localSubscription = subscriptionId
    ? await prisma.subscription.findFirst({
        where: {
          id: subscriptionId,
          userId
        },
        include: { plan: true }
      })
    : await getLatestLocalSubscription(userId);

  if (!localSubscription) {
    throw new Error("Subscription not found.");
  }

  if (!localSubscription.providerSubscriptionId) {
    const updated = await prisma.subscription.update({
      where: { id: localSubscription.id },
      data: {
        status: SubscriptionStatus.CANCELED,
        canceledAt: new Date()
      },
      include: { plan: true }
    });

    await prisma.user.update({
      where: { id: userId },
      data: { billingStatus: BillingStatus.CANCELED }
    });

    await trackEvent({
      eventName: "subscription_canceled",
      category: "BILLING",
      userId,
      metadata: {
        subscriptionId: updated.id
      }
    });

    await notifyUser({
      userId,
      templateKey: "billing_cancel_scheduled",
      payload: {
        planName: updated.plan.name,
        cycleEnd: formatBillingDate(updated.cycleEnd ?? updated.renewsAt)
      },
      sendEmail: true
    });

    return updated;
  }

  const stripe = getStripe();
  const stripeSubscription = await stripe.subscriptions.update(
    localSubscription.providerSubscriptionId,
    {
      cancel_at_period_end: true,
      metadata: {
        userId,
        planSlug: localSubscription.plan.slug,
        billingInterval:
          resolveIntervalForStripePriceId(
            (await stripe.subscriptions.retrieve(localSubscription.providerSubscriptionId)).items
              .data[0]?.price.id ?? null
          ) ?? "monthly"
      }
    }
  );

  const updated = await syncSubscriptionFromStripe(stripeSubscription, {
    eventName: "subscription_cancel_scheduled"
  });

  await notifyUser({
    userId,
    templateKey: "billing_cancel_scheduled",
    payload: {
      planName: updated.plan.name,
      cycleEnd: formatBillingDate(updated.cycleEnd ?? updated.renewsAt)
    },
    sendEmail: true
  });

  return updated;
}

export async function processStripeWebhook(event: Stripe.Event) {
  try {
    await prisma.billingWebhookEvent.create({
      data: {
        provider: "stripe",
        providerEventId: event.id,
        eventType: event.type,
        payloadJson: JSON.parse(
          JSON.stringify(event.data.object)
        ) as Prisma.InputJsonValue
      }
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { duplicate: true };
    }

    throw error;
  }

  const stripe = getStripe();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      if (subscriptionId) {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        const subscription = await syncSubscriptionFromStripe(stripeSubscription, {
          eventName: "checkout_completed"
        });

        await notifyUser({
          userId: subscription.userId,
          templateKey: "membership_active",
          payload: {
            planName: subscription.plan.name,
            cycleEnd: formatBillingDate(subscription.cycleEnd ?? subscription.renewsAt)
          },
          sendEmail: true
        });
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await syncSubscriptionFromStripe(event.data.object as Stripe.Subscription, {
        eventName: event.type.replace(/\./g, "_")
      });
      break;
    }
    case "invoice.paid":
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const invoiceSubscription = invoice.parent?.subscription_details?.subscription;
      const subscriptionId =
        typeof invoiceSubscription === "string"
          ? invoiceSubscription
          : invoiceSubscription?.id;

      if (subscriptionId) {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        const subscription = await syncSubscriptionFromStripe(stripeSubscription, {
          eventName: event.type.replace(/\./g, "_"),
          billingStatus:
            event.type === "invoice.payment_failed"
              ? BillingStatus.GRACE_PERIOD
              : undefined
        });

        if (event.type === "invoice.payment_failed") {
          await notifyUser({
            userId: subscription.userId,
            templateKey: "billing_payment_failed",
            payload: {
              planName: subscription.plan.name,
              cycleEnd: formatBillingDate(subscription.cycleEnd ?? subscription.renewsAt)
            },
            sendEmail: true
          });
        } else if (invoice.billing_reason === "subscription_cycle") {
          await notifyUser({
            userId: subscription.userId,
            templateKey: "billing_renewed",
            payload: {
              planName: subscription.plan.name,
              cycleEnd: formatBillingDate(subscription.cycleEnd ?? subscription.renewsAt)
            },
            sendEmail: true
          });
        }
      }
      break;
    }
    default:
      break;
  }

  return { duplicate: false };
}

export async function purchaseUnlock(params: {
  userId: string;
  offerSlug?: string;
  contentSlug?: string;
}) {
  const { userId, offerSlug, contentSlug } = params;

  if (!(await isFeatureEnabled("new_purchases_enabled"))) {
    throw new Error("New purchases are temporarily paused.");
  }

  if (!offerSlug && !contentSlug) {
    throw new Error("No offer or content item was selected.");
  }

  if (offerSlug) {
    const offer = await prisma.offer.findUnique({
      where: { slug: offerSlug },
      include: { contentItem: true }
    });

    if (!offer || !offer.isActive) {
      throw new Error("That offer is not available.");
    }

    const purchase = await prisma.purchase.create({
      data: {
        userId,
        offerId: offer.id,
        contentItemId: offer.contentItemId ?? undefined,
        amountCents: offer.priceCents,
        providerPaymentId: `demo_payment_${offer.slug}_${Date.now()}`,
        status: PurchaseStatus.PAID
      }
    });

    if (offer.contentItemId) {
      await prisma.entitlement.create({
        data: {
          userId,
          contentItemId: offer.contentItemId,
          personaId: offer.personaId,
          entitlementType: EntitlementType.CONTENT_UNLOCK,
          sourceType: EntitlementSourceType.PURCHASE,
          sourceId: purchase.id
        }
      });
    }

    if (offer.offerType === OfferType.CHAT_CREDITS) {
      await prisma.entitlement.create({
        data: {
          userId,
          personaId: offer.personaId,
          entitlementType: EntitlementType.CHAT_CREDITS,
          sourceType: EntitlementSourceType.PURCHASE,
          sourceId: purchase.id,
          unitsGranted: offer.unitsGranted ?? 0,
          unitsRemaining: offer.unitsGranted ?? 0
        }
      });
    }

    await trackEvent({
      eventName: "offer_purchased",
      category: "BILLING",
      userId,
      personaId: offer.personaId,
      metadata: {
        offerSlug: offer.slug
      }
    });

    return purchase;
  }

  const contentItem = await prisma.contentItem.findUnique({
    where: { slug: contentSlug }
  });

  if (!contentItem || !contentItem.isPremium || !contentItem.priceCents) {
    throw new Error("That content item cannot be purchased.");
  }

  const purchase = await prisma.purchase.create({
    data: {
      userId,
      contentItemId: contentItem.id,
      amountCents: contentItem.priceCents,
      providerPaymentId: `demo_payment_${contentItem.slug}_${Date.now()}`,
      status: PurchaseStatus.PAID
    }
  });

  await prisma.entitlement.create({
    data: {
      userId,
      contentItemId: contentItem.id,
      personaId: contentItem.personaId,
      entitlementType: EntitlementType.CONTENT_UNLOCK,
      sourceType: EntitlementSourceType.PURCHASE,
      sourceId: purchase.id
    }
  });

  await trackEvent({
    eventName: "content_purchased",
    category: "BILLING",
    userId,
    personaId: contentItem.personaId,
    metadata: {
      contentSlug: contentItem.slug
    }
  });

  return purchase;
}

export async function refundPurchase(purchaseId: string) {
  const purchase = await prisma.purchase.update({
    where: { id: purchaseId },
    data: {
      status: PurchaseStatus.REFUNDED,
      refundedAt: new Date()
    }
  });

  await trackEvent({
    eventName: "purchase_refunded",
    category: "BILLING",
    userId: purchase.userId,
    metadata: {
      purchaseId
    }
  });

  return purchase;
}
