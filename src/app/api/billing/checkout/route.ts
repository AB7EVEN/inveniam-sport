import { NextResponse } from "next/server";

import { jsonError, parseJsonBody, requireApiViewer } from "@/lib/server/api";
import { isVerifiedUser } from "@/lib/server/access";
import { subscribeUserToPlan } from "@/lib/server/billing";
import { normalizeBillingInterval } from "@/lib/server/stripe";

export async function POST(request: Request) {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  if (!isVerifiedUser(auth.viewer.user)) {
    return NextResponse.json({ error: "Verification required." }, { status: 403 });
  }

  const body = await parseJsonBody<{
    planSlug?: string;
    billingInterval?: string;
  }>(request);

  if (!body?.planSlug) {
    return jsonError("Plan slug is required.");
  }

  try {
    const result = await subscribeUserToPlan(
      auth.viewer.user.id,
      auth.viewer.user.email,
      body.planSlug,
      normalizeBillingInterval(body.billingInterval)
    );

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to start checkout.",
      400
    );
  }
}
