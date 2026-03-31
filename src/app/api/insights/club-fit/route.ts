import { NextResponse } from "next/server";

import { requireApiViewer } from "@/lib/server/api";
import { buildClubFit } from "@/lib/server/inveniam";

export async function POST() {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  const result = await buildClubFit(auth.viewer.user.id);
  return NextResponse.json(result);
}
