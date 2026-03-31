import "server-only";

import { prisma } from "@/lib/prisma";

export async function logAdminAction(
  adminUserId: string,
  actionType: string,
  targetType: string,
  targetId: string,
  metadata?: Record<string, unknown>
) {
  await prisma.adminAuditLog.create({
    data: {
      adminUserId,
      actionType,
      targetType,
      targetId,
      metadataJson: metadata ? JSON.stringify(metadata) : undefined
    }
  });
}

