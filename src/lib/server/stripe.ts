import "server-only";

import Stripe from "stripe";

export type BillingInterval = "monthly" | "annual";

const STRIPE_PRICE_IDS: Record<
  "basic" | "advanced" | "elite",
  Partial<Record<BillingInterval, string>>
> = {
  basic: {
    monthly: process.env.STRIPE_PRICE_BASIC_MONTHLY
  },
  advanced: {
    monthly: process.env.STRIPE_PRICE_ADVANCED_MONTHLY
  },
  elite: {
    monthly: process.env.STRIPE_PRICE_ELITE_MONTHLY,
    annual: process.env.STRIPE_PRICE_ELITE_ANNUAL
  }
} as const;

let stripeClient: Stripe | null = null;

export function getStripe() {
  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!apiKey || apiKey === "sk_test_replace_me") {
    throw new Error("Stripe secret key is not configured.");
  }

  stripeClient ??= new Stripe(apiKey, {
    appInfo: {
      name: "Inveniam Sport",
      version: "0.1.0"
    }
  });

  return stripeClient;
}

export function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function normalizeBillingInterval(value?: string | null): BillingInterval {
  return value === "annual" ? "annual" : "monthly";
}

export function resolveStripePriceId(planSlug: string, interval: BillingInterval) {
  const slug = planSlug as keyof typeof STRIPE_PRICE_IDS;
  const priceId = STRIPE_PRICE_IDS[slug]?.[interval];

  if (!priceId) {
    throw new Error(`Stripe price ID is not configured for ${planSlug} (${interval}).`);
  }

  return priceId;
}

export function resolvePlanSlugForStripePriceId(priceId: string | null | undefined) {
  if (!priceId) {
    return null;
  }

  for (const [planSlug, intervals] of Object.entries(STRIPE_PRICE_IDS)) {
    for (const configuredPriceId of Object.values(intervals)) {
      if (configuredPriceId === priceId) {
        return planSlug as keyof typeof STRIPE_PRICE_IDS;
      }
    }
  }

  return null;
}

export function resolveIntervalForStripePriceId(priceId: string | null | undefined): BillingInterval | null {
  if (!priceId) {
    return null;
  }

  for (const intervals of Object.values(STRIPE_PRICE_IDS)) {
    if (intervals.monthly === priceId) {
      return "monthly";
    }

    if (intervals.annual === priceId) {
      return "annual";
    }
  }

  return null;
}

export function getBillingPortalReturnUrl() {
  return new URL("/billing?portal=return", getAppUrl()).toString();
}

export function getCheckoutSuccessUrl() {
  return new URL("/billing?checkout=success", getAppUrl()).toString();
}

export function getCheckoutCancelUrl(planSlug: string) {
  return new URL(`/billing?checkout=canceled&plan=${encodeURIComponent(planSlug)}`, getAppUrl()).toString();
}
