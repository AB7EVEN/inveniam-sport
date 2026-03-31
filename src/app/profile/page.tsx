import Link from "next/link";

import { DisclosureBanner } from "@/components/disclosure-banner";
import { InsightActions } from "@/components/inveniam/insight-actions";
import { MediaAssetForm } from "@/components/inveniam/media-asset-form";
import { ProfileEditor } from "@/components/inveniam/profile-editor";
import { requireViewerSession } from "@/lib/auth/session";
import { getFallbackProfileWorkspace, getProfileWorkspace } from "@/lib/server/inveniam";

export default async function ProfilePage() {
  const viewer = await requireViewerSession("/profile");
  const workspace = (await getProfileWorkspace(viewer.user.id).catch(() => null)) ??
    getFallbackProfileWorkspace();
  const profile = workspace.profile;

  return (
    <div className="page-stack">
      <section className="panel hero-panel">
        <div className="page-header">
          <p className="eyebrow">Player dossier</p>
          <h1>{profile.displayName ?? viewer.user.email}</h1>
          <p>
            Professional profile surfaces should read like a polished dossier, not a
            social feed. Completeness and credibility unlock outreach privileges.
          </p>
        </div>
        <DisclosureBanner />
      </section>

      <section className="two-column dossier-grid">
        <article className="panel dossier-card">
          <div className="dossier-topline">
            <div>
              <p className="eyebrow">Core profile</p>
              <h2>
                {profile.primaryPosition ?? "Primary position pending"}
                {profile.secondaryPositions?.length ? ` / ${profile.secondaryPositions.join(" / ")}` : ""}
              </h2>
            </div>
            <span className="status-pill">{profile.completenessScore}% complete</span>
          </div>
          <p>{profile.bio ?? "Add a professional bio that explains your role, strengths, and current situation."}</p>
          <div className="detail-grid">
            <div>
              <span className="meta-label">Nationality</span>
              <strong>{profile.nationality ?? "Not set"}</strong>
            </div>
            <div>
              <span className="meta-label">Age band</span>
              <strong>{profile.ageBand ?? "Not set"}</strong>
            </div>
            <div>
              <span className="meta-label">Dominant foot</span>
              <strong>{profile.dominantFoot ?? "Not set"}</strong>
            </div>
            <div>
              <span className="meta-label">Current status</span>
              <strong>{profile.currentStatus ?? "Not set"}</strong>
            </div>
            <div>
              <span className="meta-label">Availability</span>
              <strong>{profile.availability ?? "Not set"}</strong>
            </div>
            <div>
              <span className="meta-label">Work authorization</span>
              <strong>{profile.workAuthorization ?? "Not set"}</strong>
            </div>
          </div>
          <div className="progress-shell" aria-hidden="true">
            <div className="progress-bar" style={{ width: `${profile.completenessScore}%` }} />
          </div>
          {profile.publicShareToken ? (
            <p className="meta-note">
              Public dossier: <Link href={`/players/${profile.publicShareToken}`}>/players/{profile.publicShareToken}</Link>
            </p>
          ) : null}
        </article>

        <article className="panel">
          <div className="section-heading inline-heading">
            <div>
              <p className="eyebrow">AI insights</p>
              <h2>Structured decision support</h2>
            </div>
            <Link className="button button-secondary" href="/outreach">
              Open outreach
            </Link>
          </div>
          <InsightActions />
        </article>
      </section>

      <section className="two-column dossier-grid">
        <article className="panel">
          <div className="section-heading inline-heading">
            <div>
              <p className="eyebrow">Edit dossier</p>
              <h2>Update the profile that powers your submissions</h2>
            </div>
          </div>
          <ProfileEditor profile={profile} />
        </article>

        <article className="panel">
          <div className="section-heading inline-heading">
            <div>
              <p className="eyebrow">Media and proof</p>
              <h2>Submission packet assets</h2>
            </div>
          </div>
          <div className="stack-list">
            {workspace.media.map((item) => (
              <div className="list-card" key={item.id}>
                <strong>{item.label}</strong>
                <p className="meta-note">{item.type}</p>
                {item.externalUrl ? <p className="meta-note">{item.externalUrl}</p> : null}
                {item.storagePath ? <p className="meta-note">{item.storagePath}</p> : null}
              </div>
            ))}
          </div>
          <MediaAssetForm />
        </article>
      </section>
    </div>
  );
}
