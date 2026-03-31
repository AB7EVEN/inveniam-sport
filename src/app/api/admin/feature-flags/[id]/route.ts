import { NextResponse } from "next/server";

import { jsonError, parseJsonBody, requireApiViewer } from "@/lib/server/api";
import { logAdminAction } from "@/lib/server/audit";
import { prisma } from "@/lib/prisma";

export async function PATCH(
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

  const body = await parseJsonBody<{ isEnabled?: boolean }>(request);
  if (typeof body?.isEnabled !== "boolean") {
    return jsonError("isEnabled must be provided.");
  }

  const { id } = await params;
  const flag = await prisma.featureFlag.update({
    where: { id },
    data: { isEnabled: body.isEnabled }
  });

  await logAdminAction(auth.viewer.user.id, "feature_flag.update", "feature_flag", flag.id, body);

  return NextResponse.json({ flag });
}
