import { NextResponse } from "next/server";

import { jsonError, parseJsonBody, requireApiViewer } from "@/lib/server/api";
import { logAdminAction } from "@/lib/server/audit";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const auth = await requireApiViewer();
  if ("error" in auth) {
    return auth.error;
  }

  if (auth.viewer.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await parseJsonBody<{
    slug?: string;
    displayName?: string;
  }>(request);

  if (!body?.slug || !body.displayName) {
    return jsonError("Slug and display name are required.");
  }

  const persona = await prisma.persona.create({
    data: {
      slug: body.slug,
      displayName: body.displayName,
      heroHeadline: `${body.displayName} profile`,
      heroDescription: "Admin-created persona draft.",
      shortBio: "Draft persona",
      disclosureText:
        "This is an AI generated virtual creator for adult entertainment and fantasy conversation. You are interacting with software, not a real person.",
      toneProfile: "draft",
      visualStyle: "draft",
      contentCategories: ["Draft"],
      boundaries: ["Never claims to be human"],
      sampleSnippets: ["Draft sample snippet"],
      accentColor: "#f6b36b",
      heroGradient: "linear-gradient(135deg, rgba(246, 179, 107, 0.26), rgba(255,255,255,0.08))",
      welcomeMessage: `Hi, I'm ${body.displayName}, an AI virtual creator.`
    }
  });

  await logAdminAction(auth.viewer.user.id, "persona.create", "persona", persona.id);
  return NextResponse.json({ persona }, { status: 201 });
}

