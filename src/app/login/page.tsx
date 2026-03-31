import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { DisclosureBanner } from "@/components/disclosure-banner";
import { getViewerSession } from "@/lib/auth/session";

export default async function LoginPage() {
  const viewer = await getViewerSession();

  if (viewer) {
    redirect("/dashboard");
  }

  return (
    <div className="auth-layout">
      <section className="auth-panel">
        <div className="page-header">
          <p className="eyebrow">Member access</p>
          <h1>Log in to your player workspace</h1>
          <p>
            Continue to your dossier, opportunity feed, moderated outreach workflow,
            community content, and plan settings.
          </p>
        </div>

        <AuthForm mode="login" />

        <p>
          Need an account? <Link href="/signup">Create one here</Link>.
        </p>
      </section>

      <section className="summary-card">
        <DisclosureBanner />
        <h2>Why this product feels different</h2>
        <p>
          Inveniam Sport is not built as a blast-out messaging tool. Access is gated by
          profile quality, credits, and recipient trust controls.
        </p>
      </section>
    </div>
  );
}
