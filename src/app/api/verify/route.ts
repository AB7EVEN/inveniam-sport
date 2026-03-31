import { NextResponse } from "next/server";

import { jsonError, parseJsonBody, requireApiViewer } from "@/lib/server/api";
import { runDemoVerification } from "@/lib/server/verification";

export async function POST(request: Request) {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  const body = await parseJsonBody<{ mode?: "verified" | "pending" | "failed" }>(request);

  if (!body) {
    return jsonError("Request body is required.");
  }

  const user = await runDemoVerification(auth.viewer.user.id, body.mode ?? "verified");
  return NextResponse.json({ user });
}

