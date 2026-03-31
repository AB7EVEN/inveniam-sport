"use client";

import Link from "next/link";
import { useEffect } from "react";

type AdSlotProps = {
  client?: string;
  slotId?: string;
  label: string;
  fallbackTitle: string;
  fallbackBody: string;
  fallbackHref: string;
  fallbackCta: string;
  compact?: boolean;
};

export function AdSlot({
  client,
  slotId,
  label,
  fallbackTitle,
  fallbackBody,
  fallbackHref,
  fallbackCta,
  compact = false
}: AdSlotProps) {
  const enabled = Boolean(client && slotId);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    try {
      ((window as typeof window & { adsbygoogle?: unknown[] }).adsbygoogle ??= []).push({});
    } catch {
      // Leave the slot shell in place if the network script is blocked.
    }
  }, [enabled, slotId]);

  return (
    <aside className={["ad-slot", compact ? "ad-slot-compact" : ""].filter(Boolean).join(" ")}>
      <div className="ad-slot-header">
        <span className="eyebrow">{label}</span>
        <span className="ad-chip">Ad</span>
      </div>

      {enabled ? (
        <>
          <ins
            className="adsbygoogle ad-frame"
            data-ad-client={client}
            data-ad-format="auto"
            data-ad-slot={slotId}
            data-full-width-responsive="true"
            style={{ display: "block" }}
          />
        </>
      ) : (
        <div className="ad-fallback">
          <h3>{fallbackTitle}</h3>
          <p>{fallbackBody}</p>
          <Link className="button button-secondary" href={fallbackHref}>
            {fallbackCta}
          </Link>
        </div>
      )}
    </aside>
  );
}
