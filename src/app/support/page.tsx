import { DisclosureBanner } from "@/components/disclosure-banner";
import { SupportForm } from "@/components/support-form";
import { requireViewerSession } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import { listUserSupportRequests } from "@/lib/server/support";

export default async function SupportPage({
  searchParams
}: {
  searchParams: Promise<{
    category?: string;
    subject?: string;
    conversationId?: string;
    contentItemId?: string;
  }>;
}) {
  const viewer = await requireViewerSession("/support");
  const params = await searchParams;
  const requests = await listUserSupportRequests(viewer.user.id);

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="page-header">
          <p className="eyebrow">Support</p>
          <h1>Report billing, opportunity, outreach, or community issues</h1>
          <p>
            Members can flag delivery problems, billing questions, stale opportunity
            data, or community concerns here. Operators can review the queue from the
            admin console.
          </p>
        </div>
        <DisclosureBanner />
      </section>

      <section className="two-column">
        <article className="panel">
          <h2>Open a request</h2>
          <SupportForm
            initialCategory={params.category}
            initialContentItemId={params.contentItemId}
            initialConversationId={params.conversationId}
            initialSubject={params.subject}
          />
        </article>

        <article className="panel">
          <h2>Your requests</h2>
          {requests.length ? (
            <div className="detail-list">
              {requests.map((request) => (
                <div className="detail-row stacked-row" key={request.id}>
                  <div>
                    <strong>{request.subject}</strong>
                    <p className="meta-note">
                      {request.category} · {request.status} · {formatDateTime(request.createdAt)}
                    </p>
                    <p>{request.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No support requests yet.</p>
          )}
        </article>
      </section>
    </div>
  );
}
