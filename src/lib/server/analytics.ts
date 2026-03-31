import "server-only";

import { EventCategory } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type TrackEventInput = {
  eventName: string;
  category: keyof typeof EventCategory;
  userId?: string | null;
  personaId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function trackEvent(input: TrackEventInput) {
  await prisma.analyticsEvent
    .create({
      data: {
        eventName: input.eventName,
        category: EventCategory[input.category],
        userId: input.userId ?? undefined,
        personaId: input.personaId ?? undefined,
        metadataJson: input.metadata ? JSON.stringify(input.metadata) : undefined
      }
    })
    .catch(() => null);
}

export async function getAnalyticsSnapshot() {
  const [activeSubscriptions, purchases, users, flags, events] = await Promise.all([
    prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      include: { plan: true }
    }),
    prisma.purchase.findMany({
      where: { status: { in: ["PAID", "REFUNDED"] } }
    }),
    prisma.user.count(),
    prisma.moderationFlag.count({
      where: { status: "OPEN" }
    }),
    prisma.analyticsEvent.groupBy({
      by: ["eventName"],
      _count: { _all: true }
    })
  ]);

  const mrrCents = activeSubscriptions.reduce(
    (total, subscription) => total + subscription.plan.monthlyPriceCents,
    0
  );

  const paidPurchases = purchases.filter((purchase) => purchase.status === "PAID");
  const paidUsers = new Set(paidPurchases.map((purchase) => purchase.userId));
  const arppuCents = paidUsers.size
    ? Math.round(
        paidPurchases.reduce((total, purchase) => total + purchase.amountCents, 0) /
          paidUsers.size
      )
    : 0;

  return {
    mrrCents,
    arppuCents,
    activeSubscriptions: activeSubscriptions.length,
    totalUsers: users,
    openFlags: flags,
    eventCounts: events
  };
}

