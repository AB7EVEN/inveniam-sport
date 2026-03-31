import "server-only";

import {
  FlagSeverity,
  FlagStatus,
  FlagType,
  ModerationLabel,
  RiskState
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { trackEvent } from "@/lib/server/analytics";

export type ModerationDecision = {
  status: "allow" | "review" | "block";
  label: ModerationLabel;
  flagType?: FlagType;
  severity?: FlagSeverity;
  reason?: string;
  safeReply?: string;
};

function containsAny(text: string, patterns: string[]) {
  return patterns.some((pattern) => text.includes(pattern));
}

export function moderateUserInput(input: string): ModerationDecision {
  const text = input.toLowerCase();

  if (
    containsAny(text, [
      "i am 17",
      "i'm 17",
      "minor",
      "underage",
      "young teen",
      "not 18"
    ])
  ) {
    return {
      status: "block",
      label: ModerationLabel.BLOCKED,
      flagType: FlagType.AGE,
      severity: FlagSeverity.CRITICAL,
      reason: "Possible minor or age ambiguity detected.",
      safeReply:
        "I can't continue with age-uncertain or underage content. Access is restricted until age is clearly verified."
    };
  }

  if (
    containsAny(text, [
      "address",
      "where do you live",
      "meet me",
      "come over",
      "phone number",
      "offline"
    ])
  ) {
    return {
      status: "review",
      label: ModerationLabel.REVIEW,
      flagType: FlagType.SAFETY,
      severity: FlagSeverity.HIGH,
      reason: "Offline contact or private information request detected.",
      safeReply:
        "I can't help with private contact, real-world meetups, or personal information. We can keep this in clearly disclosed AI chat."
    };
  }

  if (
    containsAny(text, [
      "blackmail",
      "threaten",
      "hurt myself",
      "kill myself",
      "doxx",
      "non consensual"
    ])
  ) {
    return {
      status: "block",
      label: ModerationLabel.BLOCKED,
      flagType: FlagType.SAFETY,
      severity: FlagSeverity.CRITICAL,
      reason: "High-risk coercion, self-harm, or violent language detected.",
      safeReply:
        "I can't continue with threats, coercion, self-harm, or harmful requests. This conversation has been flagged for review."
    };
  }

  return {
    status: "allow",
    label: ModerationLabel.CLEAR
  };
}

export function moderateAssistantOutput(output: string): ModerationDecision {
  const text = output.toLowerCase();

  if (
    containsAny(text, [
      "i am real",
      "meet you in person",
      "come find me",
      "i only need you"
    ])
  ) {
    return {
      status: "block",
      label: ModerationLabel.BLOCKED,
      flagType: FlagType.OUTPUT,
      severity: FlagSeverity.CRITICAL,
      reason: "Assistant output violated disclosure or relationship safety rules."
    };
  }

  return {
    status: "allow",
    label: ModerationLabel.CLEAR
  };
}

export async function createModerationFlag(params: {
  conversationId: string;
  messageId?: string;
  flagType: FlagType;
  severity: FlagSeverity;
  reason: string;
}) {
  const flag = await prisma.moderationFlag.create({
    data: {
      conversationId: params.conversationId,
      messageId: params.messageId,
      flagType: params.flagType,
      severity: params.severity,
      reason: params.reason,
      status: FlagStatus.OPEN
    }
  });

  await prisma.conversation.update({
    where: { id: params.conversationId },
    data: {
      riskState:
        params.severity === FlagSeverity.CRITICAL ? RiskState.BLOCKED : RiskState.FLAGGED
    }
  });

  await trackEvent({
    eventName: "moderation_flag_opened",
    category: "MODERATION",
    metadata: {
      flagType: params.flagType,
      severity: params.severity
    }
  });

  return flag;
}

export async function getModerationQueue() {
  return prisma.moderationFlag.findMany({
    where: { status: FlagStatus.OPEN },
    include: {
      conversation: {
        include: {
          user: true,
          persona: true,
          messages: {
            orderBy: { createdAt: "asc" }
          }
        }
      }
    },
    orderBy: [{ severity: "desc" }, { createdAt: "asc" }]
  });
}

export async function resolveModerationFlag(params: {
  flagId: string;
  adminUserId: string;
  action: "approve" | "warn" | "freeze" | "dismiss";
  notes?: string;
}) {
  const flag = await prisma.moderationFlag.update({
    where: { id: params.flagId },
    data: {
      status: params.action === "dismiss" ? FlagStatus.DISMISSED : FlagStatus.RESOLVED,
      resolvedById: params.adminUserId,
      resolutionNotes: params.notes,
      resolvedAt: new Date()
    }
  });

  if (params.action === "freeze") {
    await prisma.conversation.update({
      where: { id: flag.conversationId },
      data: {
        status: "FROZEN"
      }
    });
  } else {
    await prisma.conversation.update({
      where: { id: flag.conversationId },
      data: {
        riskState: "CLEAR"
      }
    });
  }

  await trackEvent({
    eventName: "moderation_flag_resolved",
    category: "MODERATION",
    userId: params.adminUserId,
    metadata: {
      action: params.action,
      flagId: params.flagId
    }
  });

  return flag;
}

