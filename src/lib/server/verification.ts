import "server-only";

import {
  AgeGateStatus,
  AgeVerificationStatus
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { trackEvent } from "@/lib/server/analytics";

export async function setAgeGate(userId: string, confirmedAdult: boolean) {
  const status = confirmedAdult ? AgeGateStatus.PASSED : AgeGateStatus.BLOCKED;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ageGateStatus: status
    }
  });

  await trackEvent({
    eventName: confirmedAdult ? "age_gate_passed" : "age_gate_blocked",
    category: "VERIFICATION",
    userId
  });

  return user;
}

export async function runDemoVerification(
  userId: string,
  mode: "verified" | "pending" | "failed" = "verified"
) {
  const statusMap = {
    verified: AgeVerificationStatus.VERIFIED,
    pending: AgeVerificationStatus.PENDING,
    failed: AgeVerificationStatus.FAILED
  };

  const status = statusMap[mode];
  const provider = process.env.AGE_VERIFICATION_PROVIDER || "demo";

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ageVerificationStatus: status
    }
  });

  await prisma.verificationEvent.create({
    data: {
      userId,
      provider,
      status,
      reference: `${provider}:${mode}:${Date.now()}`
    }
  });

  await trackEvent({
    eventName: `verification_${mode}`,
    category: "VERIFICATION",
    userId,
    metadata: {
      provider
    }
  });

  return user;
}

