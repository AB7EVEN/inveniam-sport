import { PolicyPage } from "@/components/policy-page";

export default function PrivacyPage() {
  return (
    <PolicyPage
      eyebrow="Privacy"
      intro="The MVP should store the minimum operational data required to authenticate users, manage billing, review outreach, and protect recipients."
      sections={[
        {
          heading: "What the platform stores",
          body: [
            "Core account details, plan and subscription state, player profile fields, media metadata, outreach history, moderation events, support records, and analytics events may be stored to operate the product.",
            "Verification vendors should be integrated in a way that stores status and required operational metadata rather than unnecessary sensitive identity documents."
          ]
        },
        {
          heading: "How data is used",
          body: [
            "Profile and outreach data are used to assemble professional submission packets, enforce entitlement and trust rules, and provide structured product insight.",
            "Community, moderation, and analytics data are used to keep the marketplace credible, reduce abuse, and improve launch quality over time."
          ]
        },
        {
          heading: "Data minimization",
          body: [
            "The platform should avoid storing sensitive details that are unnecessary for trust, delivery, or compliance. Internal tooling should favor auditability over hidden operator edits."
          ]
        }
      ]}
      title="Privacy policy"
    />
  );
}
