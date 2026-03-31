import { NextResponse } from "next/server";

import { jsonError, parseJsonBody, requireApiViewer } from "@/lib/server/api";
import { addMediaAsset } from "@/lib/server/inveniam";

export async function POST(request: Request) {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  const body = await parseJsonBody<{
    assetType?: "VIDEO_LINK" | "PDF_CV" | "IMAGE" | "METRICS_FILE";
    externalUrl?: string;
    storagePath?: string;
    label?: string;
  }>(request);

  if (!body?.assetType) {
    return jsonError("assetType is required.");
  }

  if (!body.externalUrl && !body.storagePath) {
    return jsonError("Provide an externalUrl or storagePath.");
  }

  const asset = await addMediaAsset(auth.viewer.user.id, {
    assetType: body.assetType,
    externalUrl: body.externalUrl,
    storagePath: body.storagePath,
    label: body.label
  });
  return NextResponse.json({ asset }, { status: 201 });
}
