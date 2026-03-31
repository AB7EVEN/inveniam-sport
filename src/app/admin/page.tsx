import { DisclosureBanner } from "@/components/disclosure-banner";
import { requireAdminSession } from "@/lib/auth/session";
import { getAdminQueueSnapshot } from "@/lib/server/inveniam";

export default async function AdminPage() {
  await requireAdminSession();
  const queue = await getAdminQueueSnapshot();

  return (
    <div className="page-stack">
      <section className="panel hero-panel">
        <div className="page-header">
          <p className="eyebrow">Admin console</p>
          <h1>Operate the platform without engineering dependency.</h1>
          <p>
            Daily operations revolve around users, stakeholders, opportunities, queues,
            content, analytics, billing exceptions, and moderation events.
          </p>
        </div>
        <DisclosureBanner />
      </section>

      <section className="stat-grid">
        <article className="metric-card">
          <p className="meta-label">Open outreach queue</p>
          <strong>{queue.outreachQueue.length}</strong>
          <p className="meta-note">Queued or review-state introduction requests.</p>
        </article>
        <article className="metric-card">
          <p className="meta-label">Visible opportunities</p>
          <strong>{queue.freshOpportunities.length}</strong>
          <p className="meta-note">Fresh items still visible to members.</p>
        </article>
        <article className="metric-card">
          <p className="meta-label">Flagged comments</p>
          <strong>{queue.flaggedComments.length}</strong>
          <p className="meta-note">Community moderation still stays intentionally lightweight in MVP.</p>
        </article>
      </section>

      <section className="two-column dashboard-grid">
        <article className="panel">
          <div className="section-heading inline-heading">
            <div>
              <p className="eyebrow">Outreach queue</p>
              <h2>Requests awaiting action</h2>
            </div>
          </div>
          <div className="stack-list">
            {queue.outreachQueue.map((item) => (
              <div className="list-card" key={item.id}>
                <div className="list-card-topline">
                  <strong>{item.opportunity?.title ?? item.stakeholder.orgName}</strong>
                  <span className="status-pill">{item.status}</span>
                </div>
                <p>{item.user.email}</p>
                <p className="meta-note">{item.stakeholder.orgName}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <p className="eyebrow">Ops notes</p>
          <h2>Manual review is a feature in v1.</h2>
          <ul className="feature-list">
            <li>Keep opportunity publishing mostly human managed while data quality matures.</li>
            <li>Resolve goodwill credits and sanctions through ledger events, not hidden overrides.</li>
            <li>Throttle users with repeated complaints or poor delivery-to-response profiles.</li>
            <li>Keep stakeholder preference windows current before scaling acquisition spend.</li>
          </ul>
          <div className="stack-list">
            {queue.freshOpportunities.map((item) => (
              <div className="list-card" key={item.id}>
                <strong>{item.title}</strong>
                <p>{item.orgName}</p>
                <p className="meta-note">Fresh through {item.freshnessExpiresAt.toLocaleDateString("en-US")}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
