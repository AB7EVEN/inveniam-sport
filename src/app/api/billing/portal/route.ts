import { NextResponse } from "next/server";

import { requireApiViewer, jsonError } from "@/lib/server/api";
import { createBillingPortalSession } from "@/lib/server/billing";

export async function POST() {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  try {
    const session = await createBillingPortalSession({
      userId: auth.viewer.user.id,
      email: auth.viewer.user.email
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to open the billing portal.",
      400
    );
  }
}
