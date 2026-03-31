import { AI_DISCLOSURE_TEXT } from "@/lib/constants";

type DisclosureBannerProps = {
  className?: string;
};

export function DisclosureBanner({ className }: DisclosureBannerProps) {
  return (
    <div className={["disclosure-banner", className].filter(Boolean).join(" ")}>
      <span className="disclosure-label">Trust controls</span>
      <p>{AI_DISCLOSURE_TEXT}</p>
    </div>
  );
}
