import { NextResponse } from "next/server";

import { requireApiViewer } from "@/lib/server/api";
import { isVerifiedUser } from "@/lib/server/access";
import { getUserFeed } from "@/lib/server/feed";

export async function GET() {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  if (!isVerifiedUser(auth.viewer.user)) {
    return NextResponse.json({ error: "Verification required." }, { status: 403 });
  }

  const feed = await getUserFeed(auth.viewer.user.id);
  return NextResponse.json({ feed });
}

