import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-topline">
        <div>
          <p className="eyebrow">Inveniam Sport</p>
          <h2>Curated access for serious footballers.</h2>
        </div>
        <p className="meta-note">
          Web-first MVP built around professional presentation, trusted opportunity
          intelligence, moderated introductions, and sponsor-ready inventory.
        </p>
      </div>

      <div className="footer-links">
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/refund-policy">Refund policy</Link>
        <Link href="/prohibited-use">Acceptable use</Link>
        <Link href="/support">Support</Link>
      </div>
      <p className="meta-note">
        18+ only. Recipient controls, moderation review, and fairness limits are part
        of the product, not afterthoughts.
      </p>
    </footer>
  );
}
