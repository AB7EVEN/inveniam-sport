import { NextResponse } from "next/server";

import { requireApiViewer } from "@/lib/server/api";
import { isVerifiedUser } from "@/lib/server/access";
import { listUserConversations } from "@/lib/server/chat";

export async function GET() {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  if (!isVerifiedUser(auth.viewer.user)) {
    return NextResponse.json({ error: "Verification required." }, { status: 403 });
  }

  const conversations = await listUserConversations(auth.viewer.user.id);
  return NextResponse.json({ conversations });
}

