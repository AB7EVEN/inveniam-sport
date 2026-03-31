import Image from "next/image";
import Link from "next/link";

import { DisclosureBanner } from "@/components/disclosure-banner";
import { AdSlot } from "@/components/inveniam/ad-slot";
import { OpportunityCard } from "@/components/inveniam/opportunity-card";
import { PlanCard } from "@/components/inveniam/plan-card";
import {
  faqs,
  launchMetrics,
  launchSteps,
  productPrinciples,
  sponsorCards
} from "@/lib/data/inveniam";
import {
  listCommunityPostsWithCounts,
  listFeaturedOpportunities,
  listSportPlans
} from "@/lib/server/inveniam";

export default async function HomePage() {
  const [plans, opportunities, posts] = await Promise.all([
    listSportPlans(),
    listFeaturedOpportunities(),
    listCommunityPostsWithCounts()
  ]);

  return (
    <div className="page-stack landing-stack">
      <section className="hero-shell">
        <div className="hero-copy">
          <p className="eyebrow">Premium web-first football access platform</p>
          <h1>Better access, better presentation, better odds of getting seen.</h1>
          <p className="hero-intro">
            Inveniam Sport helps serious 18+ footballers build professional dossiers,
            discover curated opportunities, request moderated introductions, and stay
            sharp through community and structured AI insight.
          </p>
          <div className="button-row hero-actions">
            <Link className="button button-primary" href="/signup">
              Start membership
            </Link>
            <Link className="button button-secondary" href="#pricing">
              View plans
            </Link>
          </div>
          <DisclosureBanner />
        </div>

        <div className="hero-visual">
          <div className="hero-image-grid">
            <Image
              alt="Player in motion"
              className="hero-image hero-image-tall"
              height={860}
              priority
              src="/inveniam-sport/player-1.jpg"
              width={640}
            />
            <Image
              alt="Training session"
              className="hero-image"
              height={400}
              priority
              src="/inveniam-sport/player-3.jpg"
              width={520}
            />
            <Image
              alt="Match-day portrait"
              className="hero-image"
              height={400}
              priority
              src="/inveniam-sport/player-5.jpg"
              width={520}
            />
          </div>
          <div className="hero-floating-card">
            <p className="eyebrow">Launch posture</p>
            <h2>Trust, curation, and recipient control over raw volume.</h2>
            <p>
              Credits only burn on delivery. Freshness, trust labels, and moderation
              are visible everywhere they matter.
            </p>
          </div>
        </div>
      </section>

      <section className="stat-grid">
        {launchMetrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <p className="meta-label">{metric.label}</p>
            <strong>{metric.value}</strong>
            <p className="meta-note">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="split-section" id="how-it-works">
        <div className="section-heading">
          <p className="eyebrow">How it works</p>
          <h2>A disciplined flow from profile quality to trusted delivery.</h2>
          <p>
            This MVP is intentionally conservative. It is built to create outcomes,
            not inbox noise.
          </p>
        </div>
        <div className="step-grid">
          {launchSteps.map((step, index) => (
            <article className="step-card" key={step.title}>
              <span className="step-number">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="split-section emphasis-section">
        <div className="section-heading narrow-copy">
          <p className="eyebrow">Product principles</p>
          <h2>Built like a premium access layer, not a noisy social feed.</h2>
        </div>
        <div className="principle-list">
          {productPrinciples.map((principle) => (
            <article className="principle-card" key={principle}>
              <p>{principle}</p>
            </article>
          ))}
        </div>
        <AdSlot
          client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
          fallbackBody={sponsorCards[0].body}
          fallbackCta={sponsorCards[0].cta}
          fallbackHref={sponsorCards[0].href}
          fallbackTitle={sponsorCards[0].title}
          label={sponsorCards[0].label}
          slotId={process.env.NEXT_PUBLIC_AD_SLOT_HOME_HERO}
        />
      </section>

      <section className="split-section" id="opportunities">
        <div className="section-heading">
          <p className="eyebrow">Opportunity feed</p>
          <h2>Verified openings, inferred needs, events, and open calls with visible provenance.</h2>
          <p>
            Every opportunity shows trust label, freshness, fit context, and the level
            of certainty behind the signal.
          </p>
        </div>
        <div className="card-grid compact-grid">
          {opportunities.slice(0, 3).map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
        <div className="button-row">
          <Link className="button button-secondary" href="/opportunities">
            Browse all opportunities
          </Link>
        </div>
      </section>

      <section className="split-section" id="pricing">
        <div className="section-heading">
          <p className="eyebrow">Commercial model</p>
          <h2>Keep the founder pricing. Clarify access, not unlimited blind outreach.</h2>
          <p>
            Elite includes premium access and fair-use delivery controls. The marketplace
            only works if recipients keep trusting what arrives.
          </p>
        </div>
        <div className="card-grid">
          {plans.map((plan) => (
            <PlanCard key={plan.slug} plan={plan} />
          ))}
        </div>
      </section>

      <section className="split-section community-preview">
        <div className="section-heading">
          <p className="eyebrow">Community layer</p>
          <h2>Retention comes from useful content, not clutter.</h2>
          <p>
            Member announcements, weekly roundups, office hours, and focused comments
            keep the product valuable even when a player is not sending outreach that day.
          </p>
        </div>
        <div className="card-grid compact-grid">
          {posts.map((post) => (
            <article className="panel panel-tight" key={post.id}>
              <span className="pill">{post.category}</span>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <p className="meta-note">
                {post.author} · {post.publishedAt} · {post.comments} comments
              </p>
            </article>
          ))}
        </div>
        <AdSlot
          client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
          compact
          fallbackBody={sponsorCards[1].body}
          fallbackCta={sponsorCards[1].cta}
          fallbackHref={sponsorCards[1].href}
          fallbackTitle={sponsorCards[1].title}
          label={sponsorCards[1].label}
          slotId={process.env.NEXT_PUBLIC_AD_SLOT_HOME_COMMUNITY}
        />
      </section>

      <section className="split-section faq-section" id="contact">
        <div className="section-heading">
          <p className="eyebrow">Launch FAQs</p>
          <h2>What matters for launch, monetization, and trust.</h2>
        </div>
        <div className="faq-grid">
          {faqs.map((item) => (
            <article className="faq-card" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
