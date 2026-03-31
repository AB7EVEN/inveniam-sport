import Link from "next/link";

import { DisclosureBanner } from "@/components/disclosure-banner";
import { OpportunityCard } from "@/components/inveniam/opportunity-card";
import { requireViewerSession } from "@/lib/auth/session";
import { getDashboardWorkspace } from "@/lib/server/inveniam";

export default async function DashboardPage() {
  const viewer = await requireViewerSession("/dashboard");
  const workspace = await getDashboardWorkspace(viewer.user.id);

  return (
    <div className="page-stack">
      <section className="panel hero-panel">
        <div className="page-header">
          <p className="eyebrow">Member command center</p>
          <h1>Welcome back, {viewer.user.email.split("@")[0]}.</h1>
          <p>
            Track profile readiness, remaining credits, recent delivery outcomes, and
            the next best move inside the launch workflow.
          </p>
        </div>
        <DisclosureBanner />
      </section>

      <section className="stat-grid">
        <article className="metric-card">
          <p className="meta-label">Profile completion</p>
          <strong>{workspace.summary.profileCompletion}%</strong>
          <p className="meta-note">Outreach unlock threshold sits at 85%.</p>
        </article>
        <article className="metric-card">
          <p className="meta-label">Current plan</p>
          <strong>{workspace.summary.currentPlan}</strong>
          <p className="meta-note">Upgrade deltas should apply immediately.</p>
        </article>
        <article className="metric-card">
          <p className="meta-label">Credits remaining</p>
          <strong>
            {workspace.summary.creditsRemaining} / {workspace.summary.creditsTotal}
          </strong>
          <p className="meta-note">Credits are reserved or used through the ledger.</p>
        </article>
        <article className="metric-card">
          <p className="meta-label">Unread responses</p>
          <strong>{workspace.summary.unreadResponses}</strong>
          <p className="meta-note">Next review window: {workspace.summary.nextReviewWindow}</p>
        </article>
      </section>

      <section className="two-column dashboard-grid">
        <article className="panel">
          <div className="section-heading inline-heading">
            <div>
              <p className="eyebrow">Next best opportunity</p>
              <h2>Priority match for your current dossier</h2>
            </div>
            <Link className="button button-secondary" href="/opportunities">
              Explore feed
            </Link>
          </div>
          {workspace.opportunities[0] ? (
            <OpportunityCard opportunity={workspace.opportunities[0]} showActions />
          ) : (
            <p className="empty-state">No fresh opportunities are available yet.</p>
          )}
        </article>

        <article className="panel">
          <div className="section-heading inline-heading">
            <div>
              <p className="eyebrow">Recent outreach</p>
              <h2>Queue and delivery status</h2>
            </div>
            <Link className="button button-secondary" href="/outreach">
              Open outreach
            </Link>
          </div>
          <div className="stack-list">
            {workspace.requests.map((request) => (
              <div className="list-card" key={request.id}>
                <div className="list-card-topline">
                  <strong>{request.recipient}</strong>
                  <span className="status-pill">{request.status}</span>
                </div>
                <p>{request.opportunity}</p>
                <p className="meta-note">{request.note}</p>
                <p className="meta-note">Updated {request.updatedAt}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="two-column dashboard-grid">
        <article className="panel">
          <div className="section-heading inline-heading">
            <div>
              <p className="eyebrow">Community momentum</p>
              <h2>What members are reading this week</h2>
            </div>
            <Link className="button button-secondary" href="/community">
              View community
            </Link>
          </div>
          <div className="stack-list">
            {workspace.posts.slice(0, 2).map((post) => (
              <div className="list-card" key={post.id}>
                <span className="pill">{post.category}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <p className="meta-note">{post.comments} comments</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="section-heading inline-heading">
            <div>
              <p className="eyebrow">Readiness checklist</p>
              <h2>Fastest path to higher-trust submissions</h2>
            </div>
            <Link className="button button-secondary" href="/profile">
              Refine profile
            </Link>
          </div>
          <ul className="feature-list">
            <li>Keep your football CV and work authorization current.</li>
            <li>Attach evidence-rich media before using higher-value credits.</li>
            <li>Use AI coaching to tighten professionalism, not exaggerate outcomes.</li>
            <li>Monitor recipient feedback and complaint signals to protect trust score.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
