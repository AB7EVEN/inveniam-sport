import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { DisclosureBanner } from "@/components/disclosure-banner";
import { getViewerSession } from "@/lib/auth/session";

export default async function SignupPage() {
  const viewer = await getViewerSession();

  if (viewer) {
    redirect("/dashboard");
  }

  return (
    <div className="auth-layout">
      <section className="auth-panel">
        <div className="page-header">
          <p className="eyebrow">Join Inveniam Sport</p>
          <h1>Create your account</h1>
          <p>
            Start with email and password, then move into plan selection, profile setup,
            media upload, and your first value moment in under ten minutes.
          </p>
        </div>

        <AuthForm mode="signup" />

        <p>
          Already have an account? <Link href="/login">Log in here</Link>.
        </p>
      </section>

      <section className="summary-card">
        <DisclosureBanner />
        <h2>Launch posture</h2>
        <p>
          The MVP is 18+ only, curated by humans where trust matters, and intentionally
          narrow so response quality stays healthy as the first cohort comes in.
        </p>
      </section>
    </div>
  );
}
