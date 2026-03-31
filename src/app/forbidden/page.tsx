import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <section className="panel">
      <div className="page-header">
        <p className="eyebrow">Access denied</p>
        <h1>Admin access required</h1>
        <p>
          Your account is authenticated, but it does not have the admin role needed
          for this route.
        </p>
      </div>

      <Link className="button button-secondary" href="/dashboard">
        Return to dashboard
      </Link>
    </section>
  );
}

