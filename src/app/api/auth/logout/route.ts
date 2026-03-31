import { NextResponse } from "next/server";

import {
  clearSessionCookie,
  destroySessionRecord,
  getCurrentSessionToken
} from "@/lib/auth/session";

export async function POST() {
  const token = await getCurrentSessionToken();

  await destroySessionRecord(token);

  const response = NextResponse.json({
    ok: true
  });

  clearSessionCookie(response);

  return response;
}

