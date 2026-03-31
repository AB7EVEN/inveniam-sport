import { NextResponse } from "next/server";

import { jsonError, requireApiViewer } from "@/lib/server/api";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  const { id } = await context.params;

  if (!id) {
    return jsonError("Outreach id is required.");
  }

  const requestRecord = await prisma.outreachRequest.findFirst({
    where: { id, userId: auth.viewer.user.id },
    include: {
      stakeholder: true,
      opportunity: true
    }
  });

  if (!requestRecord) {
    return jsonError("Outreach request not found.", 404);
  }

  return NextResponse.json({ request: requestRecord });
}
