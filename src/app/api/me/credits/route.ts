import { NextResponse } from "next/server";

import { requireApiViewer } from "@/lib/server/api";
import { getCurrentPlanSummary, getLatestCreditLedger } from "@/lib/server/inveniam";

export async function GET() {
  const auth = await requireApiViewer();

  if ("error" in auth) {
    return auth.error;
  }

  const [ledger, plan] = await Promise.all([
    getLatestCreditLedger(auth.viewer.user.id),
    getCurrentPlanSummary(auth.viewer.user.id)
  ]);

  return NextResponse.json({
    ledger,
    plan,
    creditsRemaining: ledger
      ? Math.max(ledger.creditsTotal - ledger.creditsUsed - ledger.creditsReserved, 0)
      : 0
  });
}
