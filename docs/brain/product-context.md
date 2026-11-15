# Product context and evidence

Recorded 2026-11-15.

## Purpose

Inveniam aims to make football career information and opportunities easier to understand and act on. The broader vision includes both agencies and players, with players able to gain greater visibility and control over their careers.

This repository currently describes a web-first football access platform for serious players aged 18 and over. Its documented launch assumptions are US-first, credit-based moderated outreach, and a visible distinction between verified opportunities and inferred club needs. See the [root README](../../README.md).

The broader agency-workflow vision is context for future product decisions, not an instruction to remove the existing player-facing scope.

## Evidence register

| Statement | Evidence / status | Boundary |
| --- | --- | --- |
| Player dashboard, dossier, opportunities, outreach, community, billing, and admin surfaces | Root README and repository source tree at the baseline | A page or route existing does not demonstrate a complete live service |
| Next.js, TypeScript, Prisma, and PostgreSQL structure | [Package scripts and dependencies](../../package.json), [schema](../../prisma/schema.prisma) | No runtime or production database audit performed for this documentation change |
| Stripe checkout, portal, subscription, and webhook code | Root README and [billing implementation](../../src/lib/server/billing.ts) | Configuration and real payment processing must be verified separately |
| Verified opportunities versus inferred needs | Root README and [product data types](../../src/lib/data/inveniam.ts) | A label alone is not evidence of independent verification |
| Player access and agency workflows are part of the wider vision | Founder direction, recorded 2026-11-15 | Does not establish adoption, revenue, or delivery dates |
| Provider feeds and club-shared intelligence | Product direction; access and coverage require validation | Do not claim a provider partnership, active feed, or real-time coverage without evidence |

## Claims discipline

- Code-defined launch metrics in `src/lib/data/inveniam.ts` are not independently verified business outcomes. Before quoting them externally, establish their source, period, definition, and whether they are examples.
- Price configuration is not willingness-to-pay evidence. Use current product sources for displayed plans; do not substitute an older brainstormed price.
- Seeded players, opportunities, relationship labels, or scores must not become factual recommendations by repetition.
- A model-generated fit explanation is judgment, not a validated statistical projection.
- Related-party usage and independent customer adoption are different evidence.
- Explain data freshness by source and observation time. “Real time” needs a defined, measured update cadence.

Add durable claims with: statement, source, source date, recorded date, scope, and status (confirmed / assumption / proposed / superseded). Unknown values remain unknown.
