import { DisclosureBanner } from "@/components/disclosure-banner";
import { OutreachComposer } from "@/components/inveniam/outreach-composer";
import { requireViewerSession } from "@/lib/auth/session";
import { getDashboardWorkspace, listFeaturedOpportunities, listOutreachForUser } from "@/lib/server/inveniam";

const outreachSteps = [
  "Player selects a stakeholder or applies through an opportunity page.",
  "System checks plan entitlement, recipient preferences, trust score, and recent send behavior.",
  "User drafts the outreach note with AI assist when available.",
  "System assembles a professional packet with profile summary, media links, and message.",
  "If required, the request enters admin review before delivery.",
  "Credit is deducted only after the introduction is actually delivered."
] as const;

export default async function OutreachPage({
  searchParams
}: {
  searchParams: Promise<{ opportunityId?: string }>;
}) {
  const viewer = await requireViewerSession("/outreach");
  const params = await searchParams;
  const [dashboard, opportunities, requests] = await Promise.all([
    getDashboardWorkspace(viewer.user.id),
    listFeaturedOpportunities(viewer.user.id),
    listOutreachForUser(viewer.user.id)
  ]);

  return (
    <div className="page-stack">
      <section className="panel hero-panel">
        <div className="page-header">
          <p className="eyebrow">Outreach workflow</p>
          <h1>Controlled introductions instead of blind messaging.</h1>
          <p>
            Delivery checks entitlement, recipient preferences, trust signals, and queue
            review before anything reaches a stakeholder.
          </p>
        </div>
        <DisclosureBanner />
      </section>

      <section className="stat-grid">
        <article className="metric-card">
          <p className="meta-label">Credits remaining</p>
          <strong>
            {dashboard.summary.creditsRemaining} / {dashboard.summary.creditsTotal}
          </strong>
          <p className="meta-note">Reset on billing-cycle anniversary. No rollover.</p>
        </article>
        <article className="metric-card">
          <p className="meta-label">Current queue posture</p>
          <strong>Human review first</strong>
          <p className="meta-note">High-risk or inferred-need submissions route to ops.</p>
        </article>
        <article className="metric-card">
          <p className="meta-label">Credit burn rule</p>
          <strong>Delivery only</strong>
          <p className="meta-note">Drafts, blocks, and moderation rejections do not consume credits.</p>
        </article>
      </section>

      <section className="two-column dashboard-grid">
        <article className="panel">
          <div className="section-heading inline-heading">
            <div>
              <p className="eyebrow">Submit introduction</p>
              <h2>Use structured AI assist and queue-aware delivery</h2>
            </div>
          </div>
          <OutreachComposer
            initialOpportunityId={params.opportunityId}
            opportunities={opportunities.map((item) => ({
              id: item.id,
              title: item.title,
              orgName: item.orgName
            }))}
          />
        </article>

        <article className="panel">
          <div className="section-heading inline-heading">
            <div>
              <p className="eyebrow">Core flow</p>
              <h2>How delivery works</h2>
            </div>
          </div>
          <ol className="ordered-list">
            {outreachSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <ul className="feature-list">
            <li>Stakeholders can pause delivery, set weekly limits, and define position/geography interest.</li>
            <li>Recipients can block repeat senders or report abuse in one action.</li>
            <li>Complaint events reduce sender trust score and can auto-throttle future sends.</li>
          </ul>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading inline-heading">
          <div>
            <p className="eyebrow">Recent requests</p>
            <h2>Current statuses and operator notes</h2>
          </div>
        </div>
        <div className="stack-list">
          {requests.map((request) => (
            <div className="list-card" key={request.id}>
              <div className="list-card-topline">
                <div>
                  <strong>{request.recipient}</strong>
                  <p>{request.opportunity}</p>
                </div>
                <span className="status-pill">{request.status}</span>
              </div>
              <p>{request.note}</p>
              <p className="meta-note">{request.updatedAt}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
