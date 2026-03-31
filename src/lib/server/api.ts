import "server-only";

import { NextResponse } from "next/server";

import { getViewerSession } from "@/lib/auth/session";
import { UserRole } from "@/generated/prisma/client";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireApiViewer() {
  const viewer = await getViewerSession();

  if (!viewer) {
    return {
      error: jsonError("Not authenticated.", 401)
    };
  }

  return { viewer };
}

export async function requireApiAdmin() {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth;
  }

  if (auth.viewer.user.role !== UserRole.ADMIN) {
    return {
      error: jsonError("Forbidden.", 403)
    };
  }

  return auth;
}

export async function parseJsonBody<T>(request: Request) {
  return (await request.json().catch(() => null)) as T | null;
}
