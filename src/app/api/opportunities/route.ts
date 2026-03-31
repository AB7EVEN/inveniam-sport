import { NextResponse } from "next/server";

import { requireApiViewer } from "@/lib/server/api";
import { listOpportunitiesForUser } from "@/lib/server/inveniam";

export async function GET(request: Request) {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  const { searchParams } = new URL(request.url);
  const opportunities = await listOpportunitiesForUser(auth.viewer.user.id, {
    position: searchParams.get("position") ?? undefined,
    trust: searchParams.get("trust") ?? undefined,
    status: searchParams.get("status") ?? undefined
  });

  return NextResponse.json({ opportunities });
}
