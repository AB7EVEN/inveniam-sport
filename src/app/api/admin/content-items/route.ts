import { NextResponse } from "next/server";

import { jsonError, parseJsonBody, requireApiViewer } from "@/lib/server/api";
import { logAdminAction } from "@/lib/server/audit";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const auth = await requireApiViewer();
  if ("error" in auth) {
    return auth.error;
  }

  if (auth.viewer.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await parseJsonBody<{
    personaId?: string;
    slug?: string;
    title?: string;
  }>(request);

  if (!body?.personaId || !body.slug || !body.title) {
    return jsonError("personaId, slug, and title are required.");
  }

  const item = await prisma.contentItem.create({
    data: {
      personaId: body.personaId,
      slug: body.slug,
      title: body.title,
      caption: "Draft content item",
      assetUrl: `demo://${body.slug}`,
      thumbnailUrl: `demo://${body.slug}/thumb`,
      contentType: "IMAGE",
      tags: ["draft"]
    }
  });

  await logAdminAction(auth.viewer.user.id, "content.create", "content_item", item.id);

  return NextResponse.json({ item }, { status: 201 });
}

