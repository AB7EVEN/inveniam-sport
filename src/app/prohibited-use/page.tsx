import { PolicyPage } from "@/components/policy-page";

export default function ProhibitedUsePage() {
  return (
    <PolicyPage
      eyebrow="Policy"
      intro="The launch product should block or escalate behavior that undermines trust, safety, legality, or recipient willingness to participate."
      sections={[
        {
          heading: "Prohibited behavior",
          body: [
            "Users may not submit false identity claims, fabricated playing history, unlicensed media, forged documents, or misleading outreach that implies guaranteed access or insider certainty.",
            "Harassment, abusive messages, stalking, spam, and attempts to bypass recipient preferences or moderation review are prohibited."
          ]
        },
        {
          heading: "Opportunity integrity",
          body: [
            "Users and partners may not publish stale, deceptive, or speculative opportunities as verified openings. Inferred signals must stay clearly labeled as inferred.",
            "The product should not be used to imply guaranteed trials, contracts, roster spots, or personal influence that does not exist."
          ]
        },
        {
          heading: "Age and compliance",
          body: [
            "The MVP is restricted to 18+ users unless a compliant guardian-managed workflow is added later.",
            "The platform should reserve the right to pause or remove access when legal, moderation, or trust concerns require intervention."
          ]
        }
      ]}
      title="Acceptable use policy"
    />
  );
}
