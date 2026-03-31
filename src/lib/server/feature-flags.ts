import "server-only";

import { prisma } from "@/lib/prisma";

export async function isFeatureEnabled(key: string) {
  const flag = await prisma.featureFlag.findUnique({
    where: { key },
    select: { isEnabled: true }
  });

  return flag?.isEnabled ?? false;
}

export async function getFeatureFlags() {
  return prisma.featureFlag.findMany({
    orderBy: { key: "asc" }
  });
}

