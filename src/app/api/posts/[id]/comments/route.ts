import { NextResponse } from "next/server";

import { jsonError, parseJsonBody, requireApiViewer } from "@/lib/server/api";
import { addCommunityComment } from "@/lib/server/inveniam";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  const { id } = await context.params;
  const body = await parseJsonBody<{ body?: string }>(request);

  if (!id || !body?.body?.trim()) {
    return jsonError("Post id and comment body are required.");
  }

  const comment = await addCommunityComment(auth.viewer.user.id, id, body.body.trim());
  return NextResponse.json({ comment }, { status: 201 });
}
