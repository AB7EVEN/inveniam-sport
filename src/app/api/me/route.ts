import { NextResponse } from "next/server";

import { getCurrentSessionToken, getViewerSession, clearSessionCookie, destroySessionRecord } from "@/lib/auth/session";

export async function GET() {
  const viewer = await getViewerSession();

  if (!viewer) {
    const staleToken = await getCurrentSessionToken();

    if (staleToken) {
      await destroySessionRecord(staleToken);
    }

    const response = NextResponse.json(
      {
        error: "Not authenticated."
      },
      { status: 401 }
    );

    clearSessionCookie(response);
    return response;
  }

  return NextResponse.json({
    user: viewer.user,
    expiresAt: viewer.expiresAt
  });
}

