import Link from "next/link";
import Image from "next/image";

import { getViewerSession } from "@/lib/auth/session";

import { LogoutButton } from "./logout-button";

export async function NavBar() {
  const viewer = await getViewerSession();

  return (
    <header className="site-header">
      <Link className="brand-lockup" href="/">
        <span className="brand-logo">
          <Image
            alt="Inveniam Sport"
            height={38}
            priority
            src="/inveniam-sport/logo.png"
            width={38}
          />
        </span>
        <span>
          <strong>Inveniam Sport</strong>
          <small>High-trust football access</small>
        </span>
      </Link>

      <nav className="site-nav">
        <Link href="/">Home</Link>
        <Link href="/#how-it-works">How it works</Link>
        <Link href="/#pricing">Pricing</Link>
        {viewer ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/profile">Profile</Link>
            <Link href="/opportunities">Opportunities</Link>
            <Link href="/outreach">Outreach</Link>
            <Link href="/community">Community</Link>
            <Link href="/billing">Billing</Link>
            <Link href="/support">Support</Link>
            {viewer.user.role === "ADMIN" ? <Link href="/admin">Admin</Link> : null}
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/community">Community</Link>
            <Link href="/support">Support</Link>
            <Link href="/login">Log in</Link>
            <Link className="button button-primary" href="/signup">
              Join now
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
