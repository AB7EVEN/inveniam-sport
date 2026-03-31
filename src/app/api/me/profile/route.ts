import { NextResponse } from "next/server";

import { jsonError, parseJsonBody, requireApiViewer } from "@/lib/server/api";
import { ensurePlayerProfile, getProfileWorkspace, upsertProfile } from "@/lib/server/inveniam";

export async function GET() {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  const workspace = await getProfileWorkspace(auth.viewer.user.id);
  return NextResponse.json(workspace);
}

export async function PUT(request: Request) {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  const body = await parseJsonBody<{
    displayName?: string;
    ageBand?: string;
    nationality?: string;
    dominantFoot?: string;
    primaryPosition?: string;
    secondaryPositions?: string[];
    heightCm?: number | null;
    currentStatus?: string;
    availability?: string;
    workAuthorization?: string;
    bio?: string;
    videoLinks?: string[];
    agentRepresentationStatus?: string;
  }>(request);

  if (!body) {
    return jsonError("Request body is required.");
  }

  await ensurePlayerProfile(auth.viewer.user.id);
  const profile = await upsertProfile(auth.viewer.user.id, body);

  return NextResponse.json({ profile });
}
