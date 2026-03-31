import { NextResponse } from "next/server";

import { jsonError, requireApiViewer } from "@/lib/server/api";
import { resolveSupportRequest } from "@/lib/server/support";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiViewer();
  if ("error" in auth) {
    return auth.error;
  }

  if (auth.viewer.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return jsonError("Support request id is required.");
  }

  const supportRequest = await resolveSupportRequest(id, auth.viewer.user.id);
  return NextResponse.json({ supportRequest });
}
