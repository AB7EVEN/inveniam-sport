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

  const body = await parseJsonBody<{ isActive?: boolean }>(request);
  if (typeof body?.isActive !== "boolean") {
    return jsonError("isActive must be provided.");
  }

  const { id } = await params;
  const persona = await prisma.persona.update({
    where: { id },
    data: { isActive: body.isActive }
  });

  await logAdminAction(auth.viewer.user.id, "persona.update", "persona", id, body);

  return NextResponse.json({ persona });
}

