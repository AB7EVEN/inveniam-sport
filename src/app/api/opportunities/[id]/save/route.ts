import { NextResponse } from "next/server";

import { jsonError, requireApiViewer } from "@/lib/server/api";
import { toggleSavedOpportunity } from "@/lib/server/inveniam";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  const { id } = await context.params;

  if (!id) {
    return jsonError("Opportunity id is required.");
  }

  const result = await toggleSavedOpportunity(auth.viewer.user.id, id);
  return NextResponse.json(result);
}
