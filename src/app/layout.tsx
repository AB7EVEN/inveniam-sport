import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Footer } from "@/components/footer";
import { AdProviderScript } from "@/components/inveniam/ad-provider-script";
import { NavBar } from "@/components/nav-bar";

import "./globals.css";

export const metadata: Metadata = {
  title: "Inveniam Sport",
  description:
    "Premium web-first football access platform for serious 18+ players: curated opportunities, trusted introductions, community, and ad-ready launch surfaces."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AdProviderScript />
        <div className="page-shell">
          <NavBar />
          <main className="page-content">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
