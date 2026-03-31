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

  const body = await parseJsonBody<{ status?: "PUBLISHED" | "ARCHIVED" | "DRAFT" }>(request);
  if (!body?.status) {
    return jsonError("status is required.");
  }

  const { id } = await params;
  const item = await prisma.contentItem.update({
    where: { id },
    data: {
      status: body.status,
      publishedAt: body.status === "PUBLISHED" ? new Date() : undefined
    }
  });

  await logAdminAction(auth.viewer.user.id, "content.update", "content_item", id, body);

  return NextResponse.json({ item });
}

