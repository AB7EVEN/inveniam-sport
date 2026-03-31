import Link from "next/link";

import { DisclosureBanner } from "@/components/disclosure-banner";
import { BillingActions } from "@/components/inveniam/billing-actions";
import { BillingPlanGrid } from "@/components/inveniam/billing-plan-grid";
import { requireViewerSession } from "@/lib/auth/session";
import {
  getCurrentSubscriptionSummary,
  getLatestCreditLedger,
  listSportPlans
} from "@/lib/server/inveniam";

type BillingPageProps = {
  searchParams: Promise<{
    checkout?: string;
    plan?: string;
    portal?: string;
  }>;
};

function getNotice(params: Awaited<BillingPageProps["searchParams"]>) {
  if (params.checkout === "success") {
    return "Checkout completed. Stripe will confirm the subscription and the dashboard will refresh as soon as the webhook lands.";
  }

  if (params.checkout === "canceled") {
    return "Checkout was canceled before payment was completed.";
  }

  if (params.portal === "return") {
    return "Returned from Stripe billing portal. Any plan or cancellation changes will sync back here automatically.";
  }

  return null;
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const viewer = await requireViewerSession("/billing");
  const params = await searchParams;
  const [plans, subscription, ledger] = await Promise.all([
    listSportPlans(),
    getCurrentSubscriptionSummary(viewer.user.id),
    getLatestCreditLedger(viewer.user.id)
  ]);
  const notice = getNotice(params);
  const currentPlan = subscription?.plan ?? null;

  return (
    <div className="page-stack">
      <section className="panel hero-panel">
        <div className="page-header">
          <p className="eyebrow">Billing and entitlements</p>
          <h1>Stripe now drives checkout, subscription changes, and entitlement sync.</h1>
          <p>
            New memberships launch through hosted checkout. Upgrades can apply immediately,
            and webhooks keep local plan state, credit ledgers, and billing status aligned.
          </p>
        </div>
        <DisclosureBanner />
        {notice ? <p className="meta-note">{notice}</p> : null}
      </section>

      <section className="two-column dashboard-grid">
        <article className="panel">
          <p className="eyebrow">Current membership</p>
          <h2>{currentPlan?.name ?? "No active plan"}</h2>
          <p>
            Active members keep access through the paid cycle after cancelation. Failed
            payments should enter a grace state before any read-only restriction kicks in.
          </p>
          <div className="feature-list">
            <li>Status: {viewer.user.billingStatus.replace(/_/g, " ").toLowerCase()}</li>
            <li>Cycle ends: {ledger?.cycleEnd.toLocaleDateString("en-US") ?? "N/A"}</li>
            <li>Credits total: {ledger?.creditsTotal ?? 0}</li>
            <li>Credits used: {ledger?.creditsUsed ?? 0}</li>
            <li>Credits reserved: {ledger?.creditsReserved ?? 0}</li>
          </div>
          <BillingActions subscriptionId={subscription?.id ?? null} />
        </article>

        <article className="panel">
          <p className="eyebrow">Live billing checklist</p>
          <h2>What still matters before full production rollout</h2>
          <ul className="feature-list">
            <li>Real Stripe price IDs for each launch plan</li>
            <li>Stripe customer portal configuration for downgrades and self-serve changes</li>
            <li>Production database and background job runner</li>
            <li>Transactional email provider for onboarding and response alerts</li>
          </ul>
          <div className="button-row">
            <Link className="button button-secondary" href="/support?category=BILLING&subject=Billing%20question">
              Contact billing support
            </Link>
            <Link className="button button-secondary" href="/outreach">
              View usage
            </Link>
          </div>
        </article>
      </section>

      <section>
        <div className="section-heading">
          <p className="eyebrow">Choose your plan</p>
          <h2>Monthly plans are live in-app. Downgrades route through Stripe for accuracy.</h2>
          <p>
            Elite annual is available alongside monthly checkout. If you are downgrading,
            the flow will hand off to the Stripe portal so the next-renewal behavior stays honest.
          </p>
        </div>
        <BillingPlanGrid
          currentPlanSlug={currentPlan?.slug ?? null}
          plans={plans}
          selectedPlanSlug={params.plan ?? null}
        />
      </section>
    </div>
  );
}
