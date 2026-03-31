import { NextResponse } from "next/server";

import { requireApiViewer } from "@/lib/server/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  const [subscription, ledger] = await Promise.all([
    prisma.subscription.findFirst({
      where: { userId: auth.viewer.user.id },
      include: { plan: true },
      orderBy: [{ renewsAt: "desc" }, { createdAt: "desc" }]
    }),
    prisma.creditLedger.findFirst({
      where: { userId: auth.viewer.user.id },
      orderBy: { cycleEnd: "desc" }
    })
  ]);

  return NextResponse.json({
    billingStatus: auth.viewer.user.billingStatus,
    subscription,
    ledger
  });
}
