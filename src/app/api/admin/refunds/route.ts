import { NextResponse } from "next/server";

import { refundPurchase } from "@/lib/server/billing";
import { logAdminAction } from "@/lib/server/audit";
import { jsonError, parseJsonBody, requireApiViewer } from "@/lib/server/api";

export async function POST(request: Request) {
  const auth = await requireApiViewer();
  if ("error" in auth) {
    return auth.error;
  }

  if (auth.viewer.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await parseJsonBody<{ purchaseId?: string }>(request);
  if (!body?.purchaseId) {
    return jsonError("purchaseId is required.");
  }

  const purchase = await refundPurchase(body.purchaseId);
  await logAdminAction(auth.viewer.user.id, "purchase.refund", "purchase", purchase.id);

  return NextResponse.json({ purchase });
}

