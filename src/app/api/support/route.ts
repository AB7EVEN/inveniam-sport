import { NextResponse } from "next/server";

import { jsonError, parseJsonBody, requireApiViewer } from "@/lib/server/api";
import { createSupportRequest, listUserSupportRequests } from "@/lib/server/support";

export async function GET() {
  const auth = await requireApiViewer();
  if ("error" in auth) {
    return auth.error;
  }

  const requests = await listUserSupportRequests(auth.viewer.user.id);
  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  const auth = await requireApiViewer();
  if ("error" in auth) {
    return auth.error;
  }

  const body = await parseJsonBody<{
    category?: "QUALITY" | "BILLING" | "CONTENT" | "SAFETY" | "OTHER";
    subject?: string;
    message?: string;
    conversationId?: string;
    contentItemId?: string;
  }>(request);

  if (!body?.category || !body.subject || !body.message) {
    return jsonError("category, subject, and message are required.");
  }

  const supportRequest = await createSupportRequest({
    userId: auth.viewer.user.id,
    category: body.category,
    subject: body.subject,
    message: body.message,
    conversationId: body.conversationId,
    contentItemId: body.contentItemId
  });

  return NextResponse.json({ supportRequest }, { status: 201 });
}

