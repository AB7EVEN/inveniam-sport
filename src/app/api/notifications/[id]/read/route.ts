import { NextResponse } from "next/server";

import { jsonError, requireApiViewer } from "@/lib/server/api";
import { markNotificationRead } from "@/lib/server/inveniam";

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  const { id } = await context.params;

  if (!id) {
    return jsonError("Notification id is required.");
  }

  try {
    const notification = await markNotificationRead(auth.viewer.user.id, id);
    return NextResponse.json({ notification });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to update notification.", 404);
  }
}
