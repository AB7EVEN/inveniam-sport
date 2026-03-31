import Link from "next/link";

import { AdSlot } from "@/components/inveniam/ad-slot";
import { OpportunityCard } from "@/components/inveniam/opportunity-card";
import { requireViewerSession } from "@/lib/auth/session";
import { sponsorCards } from "@/lib/data/inveniam";
import { listOpportunitiesForUser } from "@/lib/server/inveniam";

const positions = ["All", "Winger", "Center Back", "Fullback", "Defensive Midfielder"] as const;
const trustOptions = ["All", "Verified", "Inferred"] as const;

export default async function OpportunitiesPage({
  searchParams
}: {
  searchParams: Promise<{
    position?: string;
    trust?: string;
  }>;
}) {
  const viewer = await requireViewerSession("/opportunities");
  const params = await searchParams;

  const activePosition = positions.includes((params.position as (typeof positions)[number]) ?? "All")
    ? ((params.position as (typeof positions)[number]) ?? "All")
    : "All";
  const activeTrust = trustOptions.includes((params.trust as (typeof trustOptions)[number]) ?? "All")
    ? ((params.trust as (typeof trustOptions)[number]) ?? "All")
    : "All";

  const opportunities = await listOpportunitiesForUser(viewer.user.id, {
    position: activePosition,
    trust: activeTrust
  });

  return (
    <div className="page-stack">
      <section className="panel hero-panel">
        <div className="page-header">
          <p className="eyebrow">Opportunity feed</p>
          <h1>Relevant, labeled, and freshness-scored opportunities.</h1>
          <p>
            Verified opportunities and inferred needs live in the same feed, but the
            trust label and rationale stay visible so users know what is confirmed and
            what is modeled.
          </p>
        </div>
      </section>

      <section className="panel">
        <div className="filter-row">
          <div>
            <p className="meta-label">Position</p>
            <div className="chip-row">
              {positions.map((position) => (
                <Link
                  className={["filter-chip", activePosition === position ? "filter-chip-active" : ""]
                    .filter(Boolean)
                    .join(" ")}
                  href={`/opportunities?position=${encodeURIComponent(position)}&trust=${encodeURIComponent(activeTrust)}`}
                  key={position}
                >
                  {position}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="meta-label">Trust label</p>
            <div className="chip-row">
              {trustOptions.map((trust) => (
                <Link
                  className={["filter-chip", activeTrust === trust ? "filter-chip-active" : ""]
                    .filter(Boolean)
                    .join(" ")}
                  href={`/opportunities?position=${encodeURIComponent(activePosition)}&trust=${encodeURIComponent(trust)}`}
                  key={trust}
                >
                  {trust}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="card-grid compact-grid">
        {opportunities.map((opportunity) => (
          <OpportunityCard key={opportunity.id} opportunity={opportunity} showActions />
        ))}
      </section>

      <AdSlot
        client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
        fallbackBody={sponsorCards[2].body}
        fallbackCta={sponsorCards[2].cta}
        fallbackHref={sponsorCards[2].href}
        fallbackTitle={sponsorCards[2].title}
        label={sponsorCards[2].label}
        slotId={process.env.NEXT_PUBLIC_AD_SLOT_OPPORTUNITIES_FOOTER}
      />
    </div>
  );
}
