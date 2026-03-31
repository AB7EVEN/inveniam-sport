"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { formatCurrency } from "@/lib/format";
import type { SportPlan } from "@/lib/data/inveniam";

type BillingPlanGridProps = {
  plans: SportPlan[];
  currentPlanSlug: string | null;
  selectedPlanSlug?: string | null;
};

export function BillingPlanGrid({
  plans,
  currentPlanSlug,
  selectedPlanSlug
}: BillingPlanGridProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const highlightedPlanSlug = useMemo(
    () => selectedPlanSlug ?? currentPlanSlug,
    [currentPlanSlug, selectedPlanSlug]
  );

  async function startCheckout(planSlug: string, billingInterval: "monthly" | "annual") {
    setError("");
    setNotice("");
    setPendingKey(`${planSlug}:${billingInterval}`);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ planSlug, billingInterval })
      });
      const result = (await response.json().catch(() => null)) as
        | {
            error?: string;
            mode?: "checkout" | "updated" | "portal" | "unchanged";
            redirectUrl?: string;
          }
        | null;

      if (!response.ok) {
        setError(result?.error ?? "Unable to start billing right now.");
        return;
      }

      if (result?.redirectUrl) {
        window.location.assign(result.redirectUrl);
        return;
      }

      if (result?.mode === "updated") {
        setNotice("Plan updated. Stripe prorations and local entitlements are now in sync.");
      } else if (result?.mode === "unchanged") {
        setNotice("That plan is already active on your account.");
      } else if (result?.mode === "portal") {
        setNotice("Redirecting you to Stripe to manage that change.");
      } else {
        setNotice("Checkout flow is ready.");
      }

      router.refresh();
    } catch {
      setError("The billing request failed. Please try again.");
    } finally {
      setPendingKey(null);
    }
  }

  return (
    <div className="stack-md">
      {notice ? <p className="meta-note">{notice}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
      <div className="card-grid">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlanSlug === plan.slug;
          const isHighlighted = highlightedPlanSlug === plan.slug;

          return (
            <article className="plan-card" key={plan.slug}>
              <div className="plan-header">
                <div>
                  <span className="pill">{isCurrentPlan ? "Current plan" : plan.badge}</span>
                  <h3>{plan.name}</h3>
                </div>
                <div className="plan-price">
                  <strong>{formatCurrency(plan.monthlyPriceCents)}</strong>
                  <span>/ month</span>
                </div>
              </div>
              <p>{plan.summary}</p>
              <div className="meta-pill">{plan.introCredits}</div>
              {plan.annualPriceCents ? (
                <p className="meta-note">Annual option: {formatCurrency(plan.annualPriceCents)} / year</p>
              ) : null}
              {isHighlighted && !isCurrentPlan ? (
                <p className="meta-note">Selected from the previous screen.</p>
              ) : null}
              <ul className="feature-list">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <div className="button-row">
                <button
                  className="button button-primary"
                  disabled={pendingKey !== null || isCurrentPlan}
                  onClick={() => startCheckout(plan.slug, "monthly")}
                  type="button"
                >
                  {pendingKey === `${plan.slug}:monthly`
                    ? "Starting..."
                    : isCurrentPlan
                      ? "Current monthly plan"
                      : `Choose ${plan.name}`}
                </button>
                {plan.annualPriceCents ? (
                  <button
                    className="button button-secondary"
                    disabled={pendingKey !== null}
                    onClick={() => startCheckout(plan.slug, "annual")}
                    type="button"
                  >
                    {pendingKey === `${plan.slug}:annual`
                      ? "Starting..."
                      : "Choose annual"}
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
