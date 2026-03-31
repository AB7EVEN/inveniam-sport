import { NextResponse } from "next/server";

import { jsonError, parseJsonBody, requireApiViewer } from "@/lib/server/api";
import { submitOutreachRequest } from "@/lib/server/inveniam";

export async function POST(request: Request) {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  const body = await parseJsonBody<{ opportunityId?: string; messageBody?: string }>(request);

  if (!body?.opportunityId || !body.messageBody?.trim()) {
    return jsonError("opportunityId and messageBody are required.");
  }

  try {
    const requestRecord = await submitOutreachRequest({
      userId: auth.viewer.user.id,
      opportunityId: body.opportunityId,
      messageBody: body.messageBody.trim()
    });

    return NextResponse.json({ request: requestRecord }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to submit request.", 400);
  }
}
