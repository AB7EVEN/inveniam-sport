import { NextResponse } from "next/server";

import { jsonError, parseJsonBody, requireApiViewer } from "@/lib/server/api";
import { cancelSubscription } from "@/lib/server/billing";

export async function POST(request: Request) {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  const body = await parseJsonBody<{ subscriptionId?: string }>(request);

  try {
    const subscription = await cancelSubscription(
      auth.viewer.user.id,
      body?.subscriptionId
    );
    return NextResponse.json({ subscription });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to cancel subscription.",
      400
    );
  }
}
