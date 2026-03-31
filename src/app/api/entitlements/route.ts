import { NextResponse } from "next/server";

import { requireApiViewer } from "@/lib/server/api";
import { getViewerAccessSnapshot, isVerifiedUser } from "@/lib/server/access";

export async function GET() {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  if (!isVerifiedUser(auth.viewer.user)) {
    return NextResponse.json({ error: "Verification required." }, { status: 403 });
  }

  const snapshot = await getViewerAccessSnapshot(auth.viewer.user.id);
  return NextResponse.json({ entitlements: snapshot.entitlements });
}

