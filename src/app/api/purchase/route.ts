import { NextResponse } from "next/server";

import { jsonError, parseJsonBody, requireApiViewer } from "@/lib/server/api";
import { isVerifiedUser } from "@/lib/server/access";
import { purchaseUnlock } from "@/lib/server/billing";

export async function POST(request: Request) {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  if (!isVerifiedUser(auth.viewer.user)) {
    return NextResponse.json({ error: "Verification required." }, { status: 403 });
  }

  const body = await parseJsonBody<{ offerSlug?: string; contentSlug?: string }>(request);
  if (!body) {
    return jsonError("Request body is required.");
  }

  try {
    const purchase = await purchaseUnlock({
      userId: auth.viewer.user.id,
      offerSlug: body.offerSlug,
      contentSlug: body.contentSlug
    });

    return NextResponse.json({ purchase });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to process purchase.",
      400
    );
  }
}

