import { NextResponse } from "next/server";

import { requireApiViewer } from "@/lib/server/api";
import { listCommunityPostsWithCounts } from "@/lib/server/inveniam";

export async function GET() {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  const posts = await listCommunityPostsWithCounts();
  return NextResponse.json({ posts });
}
