import { formatCurrency } from "@/lib/format";
import type { SportPlan } from "@/lib/data/inveniam";

type PlanCardProps = {
  plan: SportPlan;
};

export function PlanCard({ plan }: PlanCardProps) {
  return (
    <article className="plan-card">
      <div className="plan-header">
        <div>
          <span className="pill">{plan.badge}</span>
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
      <ul className="feature-list">
        {plan.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
    </article>
  );
}
