import { NextResponse } from "next/server";

import { requireApiViewer } from "@/lib/server/api";
import { getModerationQueue } from "@/lib/server/moderation";

export async function GET() {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  if (auth.viewer.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const flags = await getModerationQueue();
  return NextResponse.json({ flags });
}

