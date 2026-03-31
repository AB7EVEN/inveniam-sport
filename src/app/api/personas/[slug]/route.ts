import { NextResponse } from "next/server";

import { getPersonaCatalogBySlug } from "@/lib/server/catalog";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const persona = getPersonaCatalogBySlug(slug);

  if (!persona) {
    return NextResponse.json({ error: "Persona not found." }, { status: 404 });
  }

  return NextResponse.json({ persona });
}
