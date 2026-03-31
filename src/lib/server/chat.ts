import "server-only";

import {
  ContentStatus,
  ConversationStatus,
  ModerationLabel,
  SenderType
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { consumeChatCredit, getPersonaQuotaSnapshot } from "@/lib/server/access";
import { trackEvent } from "@/lib/server/analytics";
import { getMemoriesForPersona, upsertMemories, buildConversationSummary } from "@/lib/server/memory";
import {
  createModerationFlag,
  moderateAssistantOutput,
  moderateUserInput
} from "@/lib/server/moderation";

function composeAssistantReply(params: {
  persona: {
    displayName: string;
    toneProfile: string;
    welcomeMessage: string;
    boundaries: string[];
    sampleSnippets: string[];
  };
  userMessage: string;
  memories: Array<{ key: string; value: string }>;
  remainingIncluded: number;
  extraCredits: number;
}) {
  const { persona, userMessage, memories, remainingIncluded, extraCredits } = params;
  const memoryLine = memories[0]
    ? `You mentioned ${memories[0].key.replaceAll("_", " ")} = ${memories[0].value}, so I'm keeping that in mind.`
    : "I'm keeping this light, clearly fictional, and tuned to the persona you've chosen.";

  const quotaLine =
    remainingIncluded <= 5
      ? `You're getting close to this persona's included chat limit, so I may suggest extra credits instead of pretending to be endlessly available.`
      : `We still have room to keep the conversation moving inside your plan limits.`;

  return `${persona.displayName}: ${persona.sampleSnippets[0]} ${memoryLine} You said: "${userMessage.slice(
    0,
    160
  )}". I'll stay in the style of ${persona.toneProfile} while respecting boundaries like ${persona.boundaries[0].toLowerCase()}. ${quotaLine}${
    extraCredits ? ` Extra credits available: ${extraCredits}.` : ""
  }`;
}

export async function ensureConversation(userId: string, personaId: string) {
  let conversation = await prisma.conversation.findUnique({
    where: {
      userId_personaId: {
        userId,
        personaId
      }
    },
    include: {
      persona: true,
      messages: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        userId,
        personaId,
        lastMessageAt: new Date(),
        messages: {
          create: {
            senderType: SenderType.ASSISTANT,
            bodyText: (
              await prisma.persona.findUniqueOrThrow({
                where: { id: personaId },
                select: { welcomeMessage: true }
              })
            ).welcomeMessage
          }
        }
      },
      include: {
        persona: true,
        messages: {
          orderBy: { createdAt: "asc" }
        }
      }
    });
  }

  return conversation;
}

export async function listUserConversations(userId: string) {
  return prisma.conversation.findMany({
    where: { userId },
    include: {
      persona: true,
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function sendConversationMessage(params: {
  userId: string;
  conversationId: string;
  bodyText: string;
}) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: params.conversationId,
      userId: params.userId
    },
    include: {
      persona: true
    }
  });

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  if (conversation.status !== ConversationStatus.ACTIVE) {
    throw new Error("This conversation is not currently available.");
  }

  const quota = await getPersonaQuotaSnapshot(params.userId, conversation.personaId);

  if (quota.monthlyQuota === 0) {
    throw new Error("Subscribe to this persona before chatting.");
  }

  let usedExtraCredit = false;
  if (quota.remainingIncluded <= 0) {
    usedExtraCredit = await consumeChatCredit(params.userId, conversation.personaId);

    if (!usedExtraCredit) {
      throw new Error("Your included quota is used up. Purchase extra chat credits to continue.");
    }
  }

  const userMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderType: SenderType.USER,
      bodyText: params.bodyText
    }
  });

  const inputDecision = moderateUserInput(params.bodyText);
  if (inputDecision.status !== "allow") {
    await createModerationFlag({
      conversationId: conversation.id,
      messageId: userMessage.id,
      flagType: inputDecision.flagType!,
      severity: inputDecision.severity!,
      reason: inputDecision.reason!
    });

    const blockedReply = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderType: SenderType.SYSTEM,
        bodyText: inputDecision.safeReply ?? "This message has been routed for review.",
        moderationLabel: inputDecision.label
      }
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: blockedReply.createdAt,
        summaryText: buildConversationSummary(params.bodyText, [])
      }
    });

    return {
      assistantMessage: blockedReply,
      moderationState: inputDecision.status
    };
  }

  await upsertMemories(params.userId, conversation.personaId, params.bodyText);
  const memories = await getMemoriesForPersona(params.userId, conversation.personaId);

  const assistantText = composeAssistantReply({
    persona: conversation.persona,
    userMessage: params.bodyText,
    memories: memories.map((item) => ({ key: item.key, value: item.value })),
    remainingIncluded: quota.remainingIncluded,
    extraCredits: quota.extraCredits
  });

  const outputDecision = moderateAssistantOutput(assistantText);
  if (outputDecision.status !== "allow") {
    await createModerationFlag({
      conversationId: conversation.id,
      messageId: userMessage.id,
      flagType: outputDecision.flagType!,
      severity: outputDecision.severity!,
      reason: outputDecision.reason!
    });

    throw new Error("The generated reply was blocked by policy.");
  }

  const assistantMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderType: SenderType.ASSISTANT,
      bodyText: assistantText,
      moderationLabel: ModerationLabel.CLEAR,
      modelName: "local-policy-composer"
    }
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageAt: assistantMessage.createdAt,
      summaryText: buildConversationSummary(
        params.bodyText,
        memories.map((item) => ({ key: item.key, value: item.value }))
      ),
      status: ConversationStatus.ACTIVE
    }
  });

  await trackEvent({
    eventName: "chat_message_sent",
    category: "ENGAGEMENT",
    userId: params.userId,
    personaId: conversation.personaId,
    metadata: {
      usedExtraCredit
    }
  });

  return {
    assistantMessage,
    moderationState: "allow" as const
  };
}

export async function getConversationPageData(userId: string, slug: string) {
  const persona = await prisma.persona.findUnique({
    where: { slug }
  });

  if (!persona) {
    return null;
  }

  const conversation = await ensureConversation(userId, persona.id);
  const quota = await getPersonaQuotaSnapshot(userId, persona.id);
  const activeOffers = await prisma.offer.findMany({
    where: {
      personaId: persona.id,
      isActive: true
    },
    include: {
      contentItem: {
        where: {
          status: ContentStatus.PUBLISHED
        }
      }
    }
  });

  return {
    persona,
    conversation,
    quota,
    suggestedOffer:
      quota.remainingIncluded <= 5
        ? activeOffers.find((offer) => offer.offerType === "CHAT_CREDITS") ?? null
        : activeOffers[0] ?? null
  };
}
