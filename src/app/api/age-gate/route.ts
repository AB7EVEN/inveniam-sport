import { NextResponse } from "next/server";

import { jsonError, parseJsonBody, requireApiViewer } from "@/lib/server/api";
import { setAgeGate } from "@/lib/server/verification";

export async function POST(request: Request) {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  const body = await parseJsonBody<{ confirmedAdult?: boolean }>(request);
  if (!body) {
    return jsonError("Request body is required.");
  }

  const user = await setAgeGate(auth.viewer.user.id, Boolean(body.confirmedAdult));

  return NextResponse.json({ user });
}
