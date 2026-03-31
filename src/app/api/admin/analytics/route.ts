import { NextResponse } from "next/server";

import { requireApiViewer } from "@/lib/server/api";
import { getAnalyticsSnapshot } from "@/lib/server/analytics";

export async function GET() {
  const auth = await requireApiViewer();
  if ("error" in auth) {
    return auth.error;
  }

  if (auth.viewer.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const analytics = await getAnalyticsSnapshot();
  return NextResponse.json({ analytics });
}

