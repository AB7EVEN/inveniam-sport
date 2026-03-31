import { NextResponse } from "next/server";

import { getPersonaCatalog } from "@/lib/server/catalog";

export function GET() {
  return NextResponse.json({
    personas: getPersonaCatalog()
  });
}

