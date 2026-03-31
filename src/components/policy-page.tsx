import { DisclosureBanner } from "@/components/disclosure-banner";

type PolicyPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{
    heading: string;
    body: string[];
  }>;
};

export function PolicyPage({ eyebrow, title, intro, sections }: PolicyPageProps) {
  return (
    <div className="page-stack">
      <section className="panel">
        <div className="page-header">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
        <DisclosureBanner />
      </section>

      {sections.map((section) => (
        <section className="panel" key={section.heading}>
          <h2>{section.heading}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}
    </div>
  );
}

