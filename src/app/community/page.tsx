import { AdSlot } from "@/components/inveniam/ad-slot";
import { CommentForm } from "@/components/inveniam/comment-form";
import { requireViewerSession } from "@/lib/auth/session";
import { sponsorCards } from "@/lib/data/inveniam";
import { listCommunityPostsWithCounts } from "@/lib/server/inveniam";

export default async function CommunityPage() {
  await requireViewerSession("/community");
  const posts = await listCommunityPostsWithCounts();

  return (
    <div className="page-stack">
      <section className="panel hero-panel">
        <div className="page-header">
          <p className="eyebrow">Community layer</p>
          <h1>Useful member content without turning the product into a chat app.</h1>
          <p>
            MVP community is announcements, content drops, weekly opportunity roundups,
            office hours, and moderated comments. Real-time chat is intentionally cut.
          </p>
        </div>
      </section>

      <section className="card-grid compact-grid">
        {posts.map((post) => (
          <article className="panel panel-tight" key={post.id}>
            <div className="list-card-topline">
              <span className="pill">{post.category}</span>
              <span className="meta-note">{post.comments} comments</span>
            </div>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <p className="meta-note">Published {post.publishedAt} by {post.author}</p>
            <CommentForm postId={post.id} />
          </article>
        ))}
      </section>

      <section className="two-column dashboard-grid">
        <article className="panel">
          <p className="eyebrow">Office hours</p>
          <h2>Weekly live review of profiles and outreach notes</h2>
          <p>
            Keep sessions focused on dossier quality, opportunity judgment, and message
            professionalism rather than hype or speculation.
          </p>
          <div className="meta-pill">Next session: Thursday, 7:00 PM ET</div>
        </article>

        <AdSlot
          client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
          fallbackBody={sponsorCards[1].body}
          fallbackCta={sponsorCards[1].cta}
          fallbackHref={sponsorCards[1].href}
          fallbackTitle={sponsorCards[1].title}
          label="Member inventory"
          slotId={process.env.NEXT_PUBLIC_AD_SLOT_COMMUNITY_SIDEBAR}
        />
      </section>
    </div>
  );
}
