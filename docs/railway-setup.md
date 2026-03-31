# Railway Setup

## What is already prepared in the repo

- Next.js is configured for `standalone` output
- The start command runs the standalone server on `0.0.0.0`
- `railway.json` defines build, start, pre-deploy migration, and healthcheck settings
- Healthcheck endpoint: `/api/health`

## Railway steps

1. Create a new Railway project
2. Add a service from GitHub and select this repository
3. Add a PostgreSQL service to the same project
4. In the app service, set these variables first:
   - `NODE_ENV=production`
   - `NEXT_PUBLIC_APP_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}`
   - `DATABASE_URL=${{Postgres.DATABASE_URL}}`
   - `AUTH_SECRET=` generated strong random string
   - `AUTH_TRUST_HOST=true`
5. Deploy once with just the core app vars above
6. Confirm `/api/health` returns `ok: true`
7. Then add the rest:
   - Stripe keys and price IDs
   - Email provider vars
   - AdSense vars
   - any admin/demo vars you want for production

## Good first production posture

Start with the app live before payments and ads:

- deploy app + Postgres
- create admin account
- confirm profile, opportunities, community, and outreach flows work
- then wire Stripe
- then wire email
- then enable ads

## Recommended first secrets to generate

- `AUTH_SECRET`: 32+ random bytes base64 or hex
- `ADMIN_PASSWORD`: long unique password if you keep seeded admin access
- `DEMO_USER_PASSWORD`: only if you want a demo account in production

## Notes

- `railway.json` runs `npm run prisma:migrate:deploy` before deploy
- the app will still build without database access during static generation because fallbacks exist for public pages
- once `DATABASE_URL` is connected to Railway Postgres, the live app will use the real database
