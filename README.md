# Inveniam Sport

Premium, web-first football access platform for serious 18+ players. This workspace now includes an Inveniam Sport launch slice built on Next.js App Router, TypeScript, Prisma, and PostgreSQL scaffolding.

## Current product surfaces

- Marketing site with trust-first positioning, pricing, FAQs, and sponsor-ready ad inventory
- Auth flows for sign up and log in
- Member dashboard, player dossier, opportunities, outreach workflow, community, billing, and admin overview pages
- Policy and support surfaces aligned to the sports platform
- Ad-ready slots with fallback sponsor placements when live network IDs are not configured

## Working assumptions

- Launch market is the United States first
- MVP is restricted to users who are 18+
- Outreach is credit-based and moderated rather than unrestricted direct messaging
- Verified opportunities and inferred need signals stay visibly differentiated

## Stack

- Frontend: Next.js App Router + TypeScript
- Styling: custom CSS system aligned to the Inveniam wireframe direction
- Database / ORM: PostgreSQL + Prisma
- Auth: email/password + database-backed sessions
- Billing: Stripe Checkout, customer portal, and webhook syncing are wired for production credentials
- Analytics: event plumbing and env hooks are available for production setup

## Local development

1. Copy [`.env.example`](/Users/arunb/Documents/Playground%2013/.env.example) to `.env`.
2. Point `DATABASE_URL` at a PostgreSQL database.
3. Install dependencies:

```bash
pnpm install
```

If `pnpm` is not available on the machine yet, `npm install` also works with the current workspace state.

4. Generate Prisma client and apply migrations:

```bash
pnpm prisma:generate
pnpm prisma:migrate:dev
```

5. Seed the database if needed:

```bash
pnpm db:seed
```

6. Start the app:

```bash
pnpm dev
```

## Environment variables to finish before going live

- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Stripe prices: `STRIPE_PRICE_BASIC_MONTHLY`, `STRIPE_PRICE_ADVANCED_MONTHLY`, `STRIPE_PRICE_ELITE_MONTHLY`, `STRIPE_PRICE_ELITE_ANNUAL`
- Email: `EMAIL_PROVIDER`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, `EMAIL_PROVIDER_API_KEY`, `POSTMARK_MESSAGE_STREAM`
- Storage: `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL`
- Analytics: `SENTRY_DSN`, `ANALYTICS_WRITE_KEY`
- Ads: `NEXT_PUBLIC_ADSENSE_CLIENT` and the `NEXT_PUBLIC_AD_SLOT_*` variables

## Billing endpoints now in place

- Hosted checkout: `POST /api/billing/checkout`
- Customer portal: `POST /api/billing/portal`
- Subscription snapshot: `GET /api/billing/subscription`
- Stripe webhook: `POST /api/webhooks/stripe`

Stripe is now expected to be the source of truth for subscription lifecycle updates. Local entitlements and credit ledgers sync from webhook events rather than manual UI toggles.

Transactional email is wired through a small provider abstraction. `EMAIL_PROVIDER=resend` and `EMAIL_PROVIDER=postmark` are supported; if the provider is left as `disabled`, the app continues creating in-app notifications without trying to send email.

## Validation commands

```bash
pnpm lint
pnpm build
```

## Important note on scope

The repo began as a different product scaffold. The public and member-facing experience has been pivoted to Inveniam Sport, but production deployment still needs real service credentials and a full data/backend migration if you want every domain object in the PDF spec persisted natively rather than represented through launch-slice content.

For the operational turn-up sequence, use [docs/launch-playbook.md](/Users/arunb/Documents/Playground%2013/docs/launch-playbook.md).

If you are deploying on Railway, use [docs/railway-setup.md](/Users/arunb/Documents/Playground%2013/docs/railway-setup.md).
