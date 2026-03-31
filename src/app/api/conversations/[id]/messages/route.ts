import { NextResponse } from "next/server";

import { jsonError, parseJsonBody, requireApiViewer } from "@/lib/server/api";
import { isVerifiedUser } from "@/lib/server/access";
import { sendConversationMessage } from "@/lib/server/chat";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  if (!isVerifiedUser(auth.viewer.user)) {
    return NextResponse.json({ error: "Verification required." }, { status: 403 });
  }

  const body = await parseJsonBody<{ bodyText?: string }>(request);
  if (!body?.bodyText?.trim()) {
    return jsonError("Message text is required.");
  }

  const { id } = await params;

  try {
    const result = await sendConversationMessage({
      userId: auth.viewer.user.id,
      conversationId: id,
      bodyText: body.bodyText
    });

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to send message.",
      400
    );
  }
}

