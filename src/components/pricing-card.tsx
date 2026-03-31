import Link from "next/link";

import { formatCurrency } from "@/lib/format";
import type { PlanSeed } from "@/lib/types/platform";

type PricingCardProps = {
  plan: PlanSeed;
  ctaHref: string;
  ctaLabel: string;
};

export function PricingCard({ plan, ctaHref, ctaLabel }: PricingCardProps) {
  return (
    <article className="pricing-card">
      <div className="pricing-header">
        <div>
          <span className="persona-label">{plan.isBundle ? "Bundle" : "Single creator"}</span>
          <h3>{plan.name}</h3>
        </div>
        <div className="price-pill">
          <strong>{formatCurrency(plan.monthlyPriceCents)}</strong>
          <span>/ month</span>
        </div>
      </div>
      <p>{plan.description}</p>
      <ul className="feature-list">
        {plan.benefits.map((benefit) => (
          <li key={benefit}>{benefit}</li>
        ))}
      </ul>
      <Link className="button button-primary button-wide" href={ctaHref}>
        {ctaLabel}
      </Link>
    </article>
  );
}

