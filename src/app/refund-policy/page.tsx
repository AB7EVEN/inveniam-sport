import { PolicyPage } from "@/components/policy-page";

export default function RefundPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Refunds"
      intro="Refund handling should be explicit, reviewable, and aligned with subscription state, moderation outcomes, and operational fairness."
      sections={[
        {
          heading: "Subscriptions",
          body: [
            "Users may cancel recurring plans from the billing area. Cancelation preserves access through the end of the paid term unless the account is suspended for policy reasons.",
            "Failed payments should move through a grace period before premium features are paused and the account becomes read-only."
          ]
        },
        {
          heading: "Credits and deliveries",
          body: [
            "Drafted outreach, blocked preferences, or moderation rejections should not consume introduction credits.",
            "If a billing or delivery issue materially prevents the service purchased, admins should be able to issue a refund or goodwill credit through an auditable ledger event."
          ]
        },
        {
          heading: "Support review",
          body: [
            "Refund requests should be reviewed through the support workflow so there is a clear record of the request, rationale, and final resolution."
          ]
        }
      ]}
      title="Refund policy"
    />
  );
}
