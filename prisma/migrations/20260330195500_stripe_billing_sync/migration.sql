ALTER TABLE "Subscription"
  ADD CONSTRAINT "Subscription_providerSubscriptionId_key" UNIQUE ("providerSubscriptionId");

CREATE TABLE "BillingWebhookEvent" (
  "id" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerEventId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "payloadJson" JSONB,

  CONSTRAINT "BillingWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BillingWebhookEvent_providerEventId_key"
  ON "BillingWebhookEvent"("providerEventId");

CREATE INDEX "BillingWebhookEvent_provider_processedAt_idx"
  ON "BillingWebhookEvent"("provider", "processedAt");
