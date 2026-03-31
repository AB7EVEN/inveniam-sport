import { NextResponse } from "next/server";

import { requireApiAdmin } from "@/lib/server/api";
import { getAdminQueueSnapshot } from "@/lib/server/inveniam";

export async function GET() {
  const auth = await requireApiAdmin();

  if ("error" in auth) {
    return auth.error;
  }

  const queue = await getAdminQueueSnapshot();
  return NextResponse.json(queue);
}
