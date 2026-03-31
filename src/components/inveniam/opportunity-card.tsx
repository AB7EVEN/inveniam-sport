import Link from "next/link";

import { ActionButton } from "@/components/action-button";
import type { OpportunityItem } from "@/lib/data/inveniam";

type OpportunityCardProps = {
  opportunity: OpportunityItem & {
    slug?: string;
    isSaved?: boolean;
  };
  showActions?: boolean;
};

export function OpportunityCard({
  opportunity,
  showActions = false
}: OpportunityCardProps) {
  return (
    <article className="opportunity-card">
      <div className="opportunity-topline">
        <span className={`trust-pill trust-pill-${opportunity.trustLabel.toLowerCase()}`}>
          {opportunity.trustLabel}
        </span>
        <span className="meta-note">{opportunity.freshness}</span>
      </div>
      <h3>{opportunity.title}</h3>
      <p>{opportunity.summary}</p>
      <div className="tag-row">
        <span className="tag-chip">{opportunity.type}</span>
        <span className="tag-chip">{opportunity.positionGroup}</span>
        <span className="tag-chip">{opportunity.geography}</span>
        <span className="tag-chip">{opportunity.level}</span>
      </div>
      <div className="score-row">
        <div>
          <span className="meta-label">Organization</span>
          <strong>{opportunity.orgName}</strong>
        </div>
        <div>
          <span className="meta-label">Fit score</span>
          <strong>{opportunity.fitScore}</strong>
        </div>
        <div>
          <span className="meta-label">Status</span>
          <strong>{opportunity.status}</strong>
        </div>
      </div>
      <p className="meta-note">{opportunity.rationale}</p>
      {showActions ? (
        <div className="button-row">
          <ActionButton
            className="button button-secondary"
            endpoint={`/api/opportunities/${opportunity.id}/save`}
            label={opportunity.isSaved ? "Unsave opportunity" : "Save opportunity"}
            pendingLabel="Saving..."
          />
          <Link className="button button-primary" href={`/outreach?opportunityId=${opportunity.id}`}>
            Request introduction
          </Link>
        </div>
      ) : null}
    </article>
  );
}
