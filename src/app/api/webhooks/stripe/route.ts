import { NextResponse } from "next/server";

import { processStripeWebhook } from "@/lib/server/billing";
import { getStripe } from "@/lib/server/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || webhookSecret === "whsec_replace_me") {
    return NextResponse.json(
      { error: "Stripe webhook secret is not configured." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    );
  }

  const body = await request.text();

  try {
    const event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
    const result = await processStripeWebhook(event);

    return NextResponse.json({ received: true, duplicate: result.duplicate });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid Stripe webhook."
      },
      { status: 400 }
    );
  }
}
