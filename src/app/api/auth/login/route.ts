import { NextResponse } from "next/server";

import { createSessionRecord, setSessionCookie } from "@/lib/auth/session";
import { publicUserSelect } from "@/lib/auth/user";
import { normalizeEmail, verifyPassword } from "@/lib/auth/password";
import { parseAuthPayload } from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const parsed = await parseAuthPayload(request);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Enter a valid email address and password."
      },
      { status: 400 }
    );
  }

  const email = normalizeEmail(parsed.data.email);
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      ...publicUserSelect,
      passwordHash: true
    }
  });

  if (!user) {
    return NextResponse.json(
      {
        error: "We could not find an account for that email."
      },
      { status: 401 }
    );
  }

  const passwordMatches = await verifyPassword(parsed.data.password, user.passwordHash);

  if (!passwordMatches) {
    return NextResponse.json(
      {
        error: "That password was incorrect."
      },
      { status: 401 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastSeenAt: new Date()
    }
  });

  const safeUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    ageGateStatus: user.ageGateStatus,
    ageVerificationStatus: user.ageVerificationStatus,
    trustScore: user.trustScore,
    billingStatus: user.billingStatus,
    createdAt: user.createdAt
  };
  const { token, expiresAt } = await createSessionRecord(user.id);
  const response = NextResponse.json({ user: safeUser });

  setSessionCookie(response, token, expiresAt);

  return response;
}
