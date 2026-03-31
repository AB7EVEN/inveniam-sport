import { NextResponse } from "next/server";

import { requireApiViewer } from "@/lib/server/api";
import { listNotificationsForUser } from "@/lib/server/inveniam";

export async function GET() {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  const notifications = await listNotificationsForUser(auth.viewer.user.id);
  return NextResponse.json({ notifications });
}
