# Inveniam Sport Launch Playbook

## 1. Core services to configure

- Database: production PostgreSQL URL in `DATABASE_URL`
- Auth: strong `AUTH_SECRET`
- Stripe: secret key, webhook secret, and all four `STRIPE_PRICE_*` IDs
- Email: set `EMAIL_PROVIDER` to `resend` or `postmark`, then add sender credentials
- Ads: set `NEXT_PUBLIC_ADSENSE_CLIENT` and the `NEXT_PUBLIC_AD_SLOT_*` values

## 2. Stripe setup

1. Create four Stripe prices:
   - Basic monthly
   - Advanced monthly
   - Elite monthly
   - Elite annual
2. Copy the price IDs into:
   - `STRIPE_PRICE_BASIC_MONTHLY`
   - `STRIPE_PRICE_ADVANCED_MONTHLY`
   - `STRIPE_PRICE_ELITE_MONTHLY`
   - `STRIPE_PRICE_ELITE_ANNUAL`
3. Point the Stripe webhook endpoint at:
   - `/api/webhooks/stripe`
4. Subscribe these events at minimum:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Configure the Stripe billing portal so members can change payment methods and manage downgrades safely.

## 3. Email setup

Supported providers:

- `resend`
- `postmark`

Current transactional sends cover:

- member welcome
- outreach submitted
- membership activated
- plan upgraded
- renewal succeeded
- payment failed
- cancellation scheduled

## 4. Ad setup

The app now loads the AdSense script once at the layout level.

To turn ads on:

1. Set `NEXT_PUBLIC_ADSENSE_CLIENT`
2. Fill slot env vars for the placements you want live
3. Keep fallback sponsor content in place for unfilled inventory or blocked scripts

## 5. Recommended deploy sequence

1. Apply migrations
2. Seed plans and baseline data if the environment is empty
3. Deploy the app
4. Add Stripe webhook secret after endpoint verification
5. Run one real checkout in production
6. Confirm:
   - checkout redirect works
   - webhook creates or updates subscription
   - credit ledger resets for the active cycle
   - billing page reflects the Stripe state
   - transactional email is delivered
   - ad slots render with either live ads or sponsor fallback

## 6. Post-launch smoke checklist

- Create account
- Complete profile to 85 percent+
- Start checkout
- Confirm billing page updates after webhook
- Submit outreach request
- Confirm in-app notification and transactional email
- Open Stripe customer portal
- Schedule cancellation and verify the state reflects locally
