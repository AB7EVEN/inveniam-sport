import { NextResponse } from "next/server";

import { jsonError, parseJsonBody, requireApiViewer } from "@/lib/server/api";
import { buildMessageAssist } from "@/lib/server/inveniam";

export async function POST(request: Request) {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  const body = await parseJsonBody<{ opportunityId?: string; draft?: string }>(request);

  if (!body?.opportunityId) {
    return jsonError("opportunityId is required.");
  }

  try {
    const result = await buildMessageAssist({
      userId: auth.viewer.user.id,
      opportunityId: body.opportunityId,
      draft: body.draft
    });
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to draft outreach.", 400);
  }
}
