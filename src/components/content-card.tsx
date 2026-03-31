import Link from "next/link";

import { ActionButton } from "@/components/action-button";
import { formatCurrency, formatDateTime } from "@/lib/format";

type ContentCardProps = {
  item: {
    id: string;
    slug: string;
    title: string;
    caption: string;
    isPremium: boolean;
    isUnlocked: boolean;
    isFavorited: boolean;
    priceCents: number | null;
    tags: string[];
    publishedAt: Date | null;
    persona: {
      displayName: string;
      accentColor: string;
    };
  };
  showFavorite?: boolean;
};

export function ContentCard({ item, showFavorite = true }: ContentCardProps) {
  return (
    <article className="content-card" style={{ borderColor: `${item.persona.accentColor}50` }}>
      <div className="content-thumb" style={{ background: item.persona.accentColor }} />
      <div className="content-meta">
        <div className="content-topline">
          <span className="persona-label">{item.persona.displayName}</span>
          <span className={item.isUnlocked ? "status-badge" : "status-badge muted"}>
            {item.isPremium ? (item.isUnlocked ? "Unlocked" : "Locked") : "Included"}
          </span>
        </div>
        <h3>{item.title}</h3>
        <p>{item.caption}</p>
        <div className="tag-row">
          {item.tags.map((tag) => (
            <span className="tag-chip" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <p className="meta-note">Published {formatDateTime(item.publishedAt)}</p>
      </div>
      <div className="content-actions">
        {!item.isUnlocked && item.priceCents ? (
          <ActionButton
            className="button button-primary button-wide"
            endpoint="/api/purchase"
            label={`Unlock ${formatCurrency(item.priceCents)}`}
            payload={{ contentSlug: item.slug }}
            pendingLabel="Unlocking..."
          />
        ) : null}
        {showFavorite ? (
          <ActionButton
            className="button button-secondary button-wide"
            endpoint="/api/favorites"
            label={item.isFavorited ? "Remove favorite" : "Save favorite"}
            payload={{ contentItemId: item.id }}
            pendingLabel="Saving..."
          />
        ) : null}
        <Link
          className="button button-secondary button-wide"
          href={`/support?category=CONTENT&subject=${encodeURIComponent(`Issue with ${item.title}`)}&contentItemId=${item.id}`}
        >
          Report issue
        </Link>
      </div>
    </article>
  );
}
