import { NextResponse } from "next/server";

import { jsonError, parseJsonBody, requireApiViewer } from "@/lib/server/api";
import { isVerifiedUser } from "@/lib/server/access";
import { toggleFavorite } from "@/lib/server/feed";

export async function POST(request: Request) {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  if (!isVerifiedUser(auth.viewer.user)) {
    return NextResponse.json({ error: "Verification required." }, { status: 403 });
  }

  const body = await parseJsonBody<{ contentItemId?: string }>(request);
  if (!body?.contentItemId) {
    return jsonError("Content item id is required.");
  }

  const isFavorited = await toggleFavorite(auth.viewer.user.id, body.contentItemId);
  return NextResponse.json({ isFavorited });
}

