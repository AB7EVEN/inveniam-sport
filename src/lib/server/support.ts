import "server-only";

import { SupportCategory, SupportStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/server/audit";
import { trackEvent } from "@/lib/server/analytics";

type CreateSupportRequestInput = {
  userId: string;
  category: keyof typeof SupportCategory;
  subject: string;
  message: string;
  conversationId?: string;
  contentItemId?: string;
};

export async function createSupportRequest(input: CreateSupportRequestInput) {
  const request = await prisma.supportRequest.create({
    data: {
      userId: input.userId,
      category: SupportCategory[input.category],
      subject: input.subject,
      message: input.message,
      conversationId: input.conversationId,
      contentItemId: input.contentItemId
    }
  });

  await trackEvent({
    eventName: "support_request_created",
    category: "OPERATIONS",
    userId: input.userId,
    metadata: {
      category: input.category
    }
  });

  return request;
}

export async function listUserSupportRequests(userId: string) {
  return prisma.supportRequest.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          persona: true
        }
      },
      contentItem: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function listOpenSupportRequests() {
  return prisma.supportRequest.findMany({
    where: { status: SupportStatus.OPEN },
    include: {
      user: true,
      conversation: {
        include: {
          persona: true
        }
      },
      contentItem: true
    },
    orderBy: { createdAt: "asc" }
  });
}

export async function resolveSupportRequest(
  supportRequestId: string,
  adminUserId: string
) {
  const request = await prisma.supportRequest.update({
    where: { id: supportRequestId },
    data: {
      status: SupportStatus.RESOLVED
    }
  });

  await logAdminAction(
    adminUserId,
    "support.resolve",
    "support_request",
    request.id
  );

  return request;
}

