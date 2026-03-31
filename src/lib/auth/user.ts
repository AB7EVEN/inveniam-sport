import type { Prisma } from "@/generated/prisma/client";

export const publicUserSelect = {
  id: true,
  email: true,
  role: true,
  status: true,
  ageGateStatus: true,
  ageVerificationStatus: true,
  trustScore: true,
  billingStatus: true,
  createdAt: true
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;
