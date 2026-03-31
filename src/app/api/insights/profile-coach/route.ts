import { NextResponse } from "next/server";

import { requireApiViewer } from "@/lib/server/api";
import { buildProfileCoach } from "@/lib/server/inveniam";

export async function POST() {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  const result = await buildProfileCoach(auth.viewer.user.id);
  return NextResponse.json(result);
}
