import { NextResponse } from "next/server";

import { createSessionRecord, setSessionCookie } from "@/lib/auth/session";
import { publicUserSelect } from "@/lib/auth/user";
import { hashPassword, normalizeEmail } from "@/lib/auth/password";
import { parseAuthPayload } from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/server/notifications";

export async function POST(request: Request) {
  const parsed = await parseAuthPayload(request);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Enter a valid email address and a password with at least 8 characters."
      },
      { status: 400 }
    );
  }

  const email = normalizeEmail(parsed.data.email);
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  });

  if (existingUser) {
    return NextResponse.json(
      {
        error: "An account with that email already exists."
      },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash
    },
    select: publicUserSelect
  });

  await prisma.playerProfile.create({
    data: {
      userId: user.id,
      publicShareToken: `player-${user.id.slice(0, 8)}`,
      completenessScore: 0
    }
  });

  const { token, expiresAt } = await createSessionRecord(user.id);
  const response = NextResponse.json({ user }, { status: 201 });

  setSessionCookie(response, token, expiresAt);

  await notifyUser({
    userId: user.id,
    templateKey: "welcome_member",
    sendEmail: true,
    sendInApp: false
  });

  return response;
}
