import "server-only";

import { redirect } from "next/navigation";

import {
  AgeGateStatus,
  AgeVerificationStatus,
  EntitlementType,
  type Prisma,
  SubscriptionStatus
} from "@/generated/prisma/client";
import { requireViewerSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export function isVerifiedUser(user: {
  ageGateStatus: AgeGateStatus;
  ageVerificationStatus: AgeVerificationStatus;
}) {
  return (
    user.ageGateStatus === AgeGateStatus.PASSED &&
    user.ageVerificationStatus === AgeVerificationStatus.VERIFIED
  );
}

export async function requireVerifiedViewerSession(nextPath = "/verify") {
  const viewer = await requireViewerSession(nextPath);

  if (!isVerifiedUser(viewer.user)) {
    redirect(`/verify?next=${encodeURIComponent(nextPath)}`);
  }

  return viewer;
}

export async function getViewerAccessSnapshot(userId: string) {
  const now = new Date();
  const [subscriptions, entitlements] = await Promise.all([
    prisma.subscription.findMany({
      where: {
        userId,
        renewsAt: { gt: now },
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELED] }
      },
      include: {
        plan: true
      }
    }),
    prisma.entitlement.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }]
      }
    })
  ]);

  const personaEntitlements = entitlements.filter(
    (item) => item.entitlementType === EntitlementType.PERSONA_ACCESS && item.personaId
  );
  const contentEntitlements = entitlements.filter(
    (item) => item.entitlementType === EntitlementType.CONTENT_UNLOCK && item.contentItemId
  );
  const creditEntitlements = entitlements.filter(
    (item) =>
      item.entitlementType === EntitlementType.CHAT_CREDITS &&
      (item.unitsRemaining ?? 0) > 0
  );

  return {
    subscriptions,
    entitlements,
    accessiblePersonaIds: new Set(
      personaEntitlements
        .map((item) => item.personaId)
        .filter((value): value is string => Boolean(value))
    ),
    unlockedContentIds: new Set(
      contentEntitlements
        .map((item) => item.contentItemId)
        .filter((value): value is string => Boolean(value))
    ),
    chatCreditEntitlements: creditEntitlements,
    totalChatCredits: creditEntitlements.reduce(
      (sum, item) => sum + (item.unitsRemaining ?? 0),
      0
    )
  };
}

export async function getPersonaQuotaSnapshot(userId: string, personaId: string) {
  const now = new Date();
  const periodStart = new Date(now);
  periodStart.setDate(periodStart.getDate() - 30);

  const [subscriptions, usedMessages] = await Promise.all([
    prisma.subscription.findMany({
      where: {
        userId,
        renewsAt: { gt: now },
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELED] },
        OR: [{ plan: { isBundle: true } }, { plan: { personaId } }]
      },
      include: {
        plan: true
      }
    }),
    prisma.message.count({
      where: {
        senderType: "USER",
        createdAt: { gte: periodStart },
        conversation: {
          userId,
          personaId
        }
      }
    })
  ]);

  const activePlans = subscriptions.map((subscription) => subscription.plan);
  const monthlyQuota = activePlans.reduce(
    (quota, plan) => Math.max(quota, plan.messageQuota),
    0
  );

  const creditEntitlements = await prisma.entitlement.findMany({
    where: {
      userId,
      entitlementType: EntitlementType.CHAT_CREDITS,
      OR: [{ personaId }, { personaId: null }],
      unitsRemaining: { gt: 0 }
    },
    orderBy: { createdAt: "asc" }
  });

  const extraCredits = creditEntitlements.reduce(
    (sum, item) => sum + (item.unitsRemaining ?? 0),
    0
  );

  return {
    monthlyQuota,
    usedMessages,
    remainingIncluded: Math.max(monthlyQuota - usedMessages, 0),
    extraCredits,
    creditEntitlements
  };
}

export async function consumeChatCredit(userId: string, personaId: string) {
  const credit = await prisma.entitlement.findFirst({
    where: {
      userId,
      entitlementType: EntitlementType.CHAT_CREDITS,
      OR: [{ personaId }, { personaId: null }],
      unitsRemaining: { gt: 0 }
    },
    orderBy: { createdAt: "asc" }
  });

  if (!credit || !credit.unitsRemaining) {
    return false;
  }

  await prisma.entitlement.update({
    where: { id: credit.id },
    data: {
      unitsRemaining: credit.unitsRemaining - 1
    }
  });

  return true;
}

export async function hasUnlockedContent(
  userId: string,
  contentItemId: string,
  isPremium: boolean
) {
  if (!isPremium) {
    return true;
  }

  const entitlement = await prisma.entitlement.findFirst({
    where: {
      userId,
      contentItemId,
      entitlementType: EntitlementType.CONTENT_UNLOCK,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
    },
    select: { id: true }
  });

  return Boolean(entitlement);
}

export type PublicContentWithState = Prisma.ContentItemGetPayload<{
  include: {
    persona: true;
    favorites: true;
  };
}> & {
  isUnlocked: boolean;
  isFavorited: boolean;
};
