import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextResponse } from "next/server";

import { UserRole } from "@/generated/prisma/client";
import { SESSION_COOKIE_NAME, SESSION_DURATION_DAYS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

import { publicUserSelect } from "./user";

const SESSION_TTL_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getCookieOptions(expiresAt?: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(expiresAt ? { expires: expiresAt } : { maxAge: 0 })
  };
}

export async function createSessionRecord(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt
    }
  });

  return { token, expiresAt };
}

export function setSessionCookie(
  response: NextResponse,
  token: string,
  expiresAt: Date
) {
  response.cookies.set(SESSION_COOKIE_NAME, token, getCookieOptions(expiresAt));
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", getCookieOptions());
}

export async function getCurrentSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function destroySessionRecord(token: string | null) {
  if (!token) {
    return;
  }

  await prisma.session.deleteMany({
    where: {
      tokenHash: hashToken(token)
    }
  });
}

export async function getViewerSession() {
  const token = await getCurrentSessionToken();

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashToken(token)
    },
    include: {
      user: {
        select: publicUserSelect
      }
    }
  });

  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  return {
    sessionId: session.id,
    expiresAt: session.expiresAt,
    user: session.user
  };
}

export async function requireViewerSession(nextPath = "/dashboard") {
  const viewer = await getViewerSession();

  if (!viewer) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return viewer;
}

export async function requireAdminSession() {
  const viewer = await requireViewerSession("/admin");

  if (viewer.user.role !== UserRole.ADMIN) {
    redirect("/forbidden");
  }

  return viewer;
}
