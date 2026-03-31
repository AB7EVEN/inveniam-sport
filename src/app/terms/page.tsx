import { PolicyPage } from "@/components/policy-page";

export default function TermsPage() {
  return (
    <PolicyPage
      eyebrow="Terms"
      intro="These terms define how the MVP should be used, who may access it, and the limits of what the platform promises."
      sections={[
        {
          heading: "Eligibility",
          body: [
            "The launch product is intended for users who are 18 or older. Youth workflows require a separate guardian-managed path and are not part of this MVP.",
            "Users must provide accurate account and profile information and may be asked to complete identity or age verification before higher-volume outreach is available."
          ]
        },
        {
          heading: "No guaranteed outcomes",
          body: [
            "Inveniam Sport improves access, presentation, and decision support. It does not guarantee trials, contracts, roster spots, or responses from any club or stakeholder.",
            "Verified opportunities, inferred needs, and open calls are labeled differently on purpose. Users must not present inferred signals as confirmed club intent."
          ]
        },
        {
          heading: "Outreach and conduct",
          body: [
            "Introduction requests are subject to credits, recipient preferences, moderation review, and fair-use controls. Credits are only deducted when a submission is actually delivered.",
            "Harassment, misrepresentation, spam-like behavior, and repeated low-quality submissions may lead to throttling, suspension, or permanent removal."
          ]
        }
      ]}
      title="Terms of service"
    />
  );
}
