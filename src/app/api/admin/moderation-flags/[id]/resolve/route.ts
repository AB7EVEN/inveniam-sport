import { NextResponse } from "next/server";

import { logAdminAction } from "@/lib/server/audit";
import { jsonError, parseJsonBody, requireApiViewer } from "@/lib/server/api";
import { resolveModerationFlag } from "@/lib/server/moderation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  if (auth.viewer.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await parseJsonBody<{ action?: "approve" | "warn" | "freeze" | "dismiss"; notes?: string }>(request);
  if (!body?.action) {
    return jsonError("Resolution action is required.");
  }

  const { id } = await params;
  const flag = await resolveModerationFlag({
    flagId: id,
    adminUserId: auth.viewer.user.id,
    action: body.action,
    notes: body.notes
  });

  await logAdminAction(auth.viewer.user.id, "moderation.resolve", "moderation_flag", flag.id, {
    action: body.action
  });

  return NextResponse.json({ flag });
}

