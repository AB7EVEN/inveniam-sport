-- Extend existing enum
ALTER TYPE "SupportCategory" ADD VALUE IF NOT EXISTS 'OPPORTUNITY';
ALTER TYPE "SupportCategory" ADD VALUE IF NOT EXISTS 'OUTREACH';
ALTER TYPE "SupportCategory" ADD VALUE IF NOT EXISTS 'COMMUNITY';

-- New enums
CREATE TYPE "BillingStatus" AS ENUM ('INACTIVE', 'ACTIVE', 'GRACE_PERIOD', 'READ_ONLY', 'CANCELED');
CREATE TYPE "MediaAssetType" AS ENUM ('VIDEO_LINK', 'PDF_CV', 'IMAGE', 'METRICS_FILE');
CREATE TYPE "MediaAssetStatus" AS ENUM ('ACTIVE', 'PENDING', 'REJECTED');
CREATE TYPE "StakeholderDeliveryMode" AS ENUM ('INBOX', 'EMAIL_RELAY', 'BOTH');
CREATE TYPE "StakeholderVerificationStatus" AS ENUM ('SEEDED', 'VERIFIED', 'PAUSED');
CREATE TYPE "OpportunityType" AS ENUM ('VERIFIED_OPPORTUNITY', 'INFERRED_NEED', 'EVENT_SHOWCASE', 'OPEN_CALL');
CREATE TYPE "OpportunityTrustLabel" AS ENUM ('VERIFIED', 'INFERRED');
CREATE TYPE "OpportunityStatus" AS ENUM ('DRAFT', 'OPEN', 'REVIEWING', 'CLOSING_SOON', 'ARCHIVED');
CREATE TYPE "OutreachStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'QUEUED', 'DELIVERED', 'REJECTED', 'DECLINED');
CREATE TYPE "OutreachResponseState" AS ENUM ('NONE', 'RESPONDED', 'SAVED', 'DECLINED', 'REPORTED');
CREATE TYPE "InsightType" AS ENUM ('PROFILE_COACH', 'CLUB_FIT', 'POSITIONAL_NEED', 'MESSAGE_ASSIST', 'OPPORTUNITY_RANKING', 'MODERATION_ASSIST');
CREATE TYPE "PostVisibility" AS ENUM ('PUBLIC', 'MEMBERS_ONLY');
CREATE TYPE "CommentStatus" AS ENUM ('PUBLISHED', 'FLAGGED', 'HIDDEN');
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'IN_APP');

-- Existing tables
ALTER TABLE "User"
  ADD COLUMN "trustScore" DOUBLE PRECISION NOT NULL DEFAULT 0.72,
  ADD COLUMN "billingStatus" "BillingStatus" NOT NULL DEFAULT 'INACTIVE';

ALTER TABLE "Plan"
  ADD COLUMN "annualPriceCents" INTEGER,
  ADD COLUMN "featuresJson" JSONB,
  ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Subscription"
  ADD COLUMN "cycleStart" TIMESTAMP(3),
  ADD COLUMN "cycleEnd" TIMESTAMP(3);

-- New tables
CREATE TABLE "PlayerProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "displayName" TEXT,
  "ageBand" TEXT,
  "nationality" TEXT,
  "dominantFoot" TEXT,
  "primaryPosition" TEXT,
  "secondaryPositions" TEXT[],
  "heightCm" INTEGER,
  "currentStatus" TEXT,
  "clubHistoryJson" JSONB,
  "videoLinks" TEXT[],
  "statisticsJson" JSONB,
  "availability" TEXT,
  "workAuthorization" TEXT,
  "agentRepresentationStatus" TEXT,
  "bio" TEXT,
  "completenessScore" INTEGER NOT NULL DEFAULT 0,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "publicShareToken" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PlayerProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MediaAsset" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "profileId" TEXT,
  "assetType" "MediaAssetType" NOT NULL,
  "storagePath" TEXT,
  "externalUrl" TEXT,
  "status" "MediaAssetStatus" NOT NULL DEFAULT 'ACTIVE',
  "metadataJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Stakeholder" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "orgName" TEXT NOT NULL,
  "contactName" TEXT,
  "roleTitle" TEXT,
  "geography" TEXT,
  "positionGroups" TEXT[],
  "deliveryMode" "StakeholderDeliveryMode" NOT NULL DEFAULT 'BOTH',
  "preferenceJson" JSONB,
  "verificationStatus" "StakeholderVerificationStatus" NOT NULL DEFAULT 'SEEDED',
  "maxWeeklyVolume" INTEGER,
  "isAcceptingProfiles" BOOLEAN NOT NULL DEFAULT true,
  "claimedByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Stakeholder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Opportunity" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "stakeholderId" TEXT,
  "createdById" TEXT,
  "opportunityType" "OpportunityType" NOT NULL,
  "title" TEXT NOT NULL,
  "orgName" TEXT NOT NULL,
  "positionGroup" TEXT NOT NULL,
  "geography" TEXT NOT NULL,
  "level" TEXT NOT NULL,
  "eligibilityNotes" TEXT,
  "trustLabel" "OpportunityTrustLabel" NOT NULL,
  "confidence" INTEGER,
  "rationaleSnippet" TEXT,
  "sourceProvenance" TEXT,
  "freshnessExpiresAt" TIMESTAMP(3) NOT NULL,
  "status" "OpportunityStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SavedOpportunity" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "opportunityId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SavedOpportunity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OutreachRequest" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "playerProfileId" TEXT,
  "stakeholderId" TEXT NOT NULL,
  "opportunityId" TEXT,
  "messageBody" TEXT NOT NULL,
  "assembledPacketUrl" TEXT,
  "status" "OutreachStatus" NOT NULL DEFAULT 'DRAFT',
  "deliveredAt" TIMESTAMP(3),
  "responseState" "OutreachResponseState" NOT NULL DEFAULT 'NONE',
  "moderationReason" TEXT,
  "recipientSnapshotJson" JSONB,
  "creditsReserved" INTEGER NOT NULL DEFAULT 0,
  "creditsConsumed" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OutreachRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CreditLedger" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "subscriptionId" TEXT,
  "cycleStart" TIMESTAMP(3) NOT NULL,
  "cycleEnd" TIMESTAMP(3) NOT NULL,
  "creditsTotal" INTEGER NOT NULL,
  "creditsUsed" INTEGER NOT NULL DEFAULT 0,
  "creditsReserved" INTEGER NOT NULL DEFAULT 0,
  "source" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CreditLedger_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AIInsight" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "profileId" TEXT,
  "insightType" "InsightType" NOT NULL,
  "inputSnapshotJson" JSONB NOT NULL,
  "outputJson" JSONB NOT NULL,
  "confidence" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AIInsight_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContentPost" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "visibility" "PostVisibility" NOT NULL DEFAULT 'MEMBERS_ONLY',
  "authorId" TEXT NOT NULL,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ContentPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Comment" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "profileId" TEXT,
  "body" TEXT NOT NULL,
  "status" "CommentStatus" NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ModerationEvent" (
  "id" TEXT NOT NULL,
  "subjectType" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "actorId" TEXT,
  "policyCode" TEXT NOT NULL,
  "actionTaken" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ModerationEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "channel" "NotificationChannel" NOT NULL,
  "templateKey" TEXT NOT NULL,
  "payloadJson" JSONB,
  "sentAt" TIMESTAMP(3),
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
CREATE UNIQUE INDEX "PlayerProfile_userId_key" ON "PlayerProfile"("userId");
CREATE UNIQUE INDEX "PlayerProfile_publicShareToken_key" ON "PlayerProfile"("publicShareToken");
CREATE UNIQUE INDEX "Stakeholder_slug_key" ON "Stakeholder"("slug");
CREATE UNIQUE INDEX "Opportunity_slug_key" ON "Opportunity"("slug");
CREATE UNIQUE INDEX "SavedOpportunity_userId_opportunityId_key" ON "SavedOpportunity"("userId", "opportunityId");
CREATE UNIQUE INDEX "ContentPost_slug_key" ON "ContentPost"("slug");

-- Supporting indexes
CREATE INDEX "MediaAsset_userId_idx" ON "MediaAsset"("userId");
CREATE INDEX "MediaAsset_profileId_idx" ON "MediaAsset"("profileId");
CREATE INDEX "MediaAsset_assetType_idx" ON "MediaAsset"("assetType");
CREATE INDEX "Stakeholder_verificationStatus_idx" ON "Stakeholder"("verificationStatus");
CREATE INDEX "Stakeholder_claimedByUserId_idx" ON "Stakeholder"("claimedByUserId");
CREATE INDEX "Opportunity_stakeholderId_idx" ON "Opportunity"("stakeholderId");
CREATE INDEX "Opportunity_trustLabel_idx" ON "Opportunity"("trustLabel");
CREATE INDEX "Opportunity_status_idx" ON "Opportunity"("status");
CREATE INDEX "Opportunity_positionGroup_idx" ON "Opportunity"("positionGroup");
CREATE INDEX "Opportunity_geography_idx" ON "Opportunity"("geography");
CREATE INDEX "SavedOpportunity_userId_idx" ON "SavedOpportunity"("userId");
CREATE INDEX "SavedOpportunity_opportunityId_idx" ON "SavedOpportunity"("opportunityId");
CREATE INDEX "OutreachRequest_userId_idx" ON "OutreachRequest"("userId");
CREATE INDEX "OutreachRequest_stakeholderId_idx" ON "OutreachRequest"("stakeholderId");
CREATE INDEX "OutreachRequest_opportunityId_idx" ON "OutreachRequest"("opportunityId");
CREATE INDEX "OutreachRequest_status_idx" ON "OutreachRequest"("status");
CREATE INDEX "CreditLedger_userId_idx" ON "CreditLedger"("userId");
CREATE INDEX "CreditLedger_subscriptionId_idx" ON "CreditLedger"("subscriptionId");
CREATE INDEX "AIInsight_userId_idx" ON "AIInsight"("userId");
CREATE INDEX "AIInsight_insightType_idx" ON "AIInsight"("insightType");
CREATE INDEX "ContentPost_publishedAt_idx" ON "ContentPost"("publishedAt");
CREATE INDEX "ContentPost_visibility_idx" ON "ContentPost"("visibility");
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");
CREATE INDEX "Comment_status_idx" ON "Comment"("status");
CREATE INDEX "ModerationEvent_subjectType_subjectId_idx" ON "ModerationEvent"("subjectType", "subjectId");
CREATE INDEX "ModerationEvent_actorId_idx" ON "ModerationEvent"("actorId");
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_readAt_idx" ON "Notification"("readAt");

-- Foreign keys
ALTER TABLE "PlayerProfile"
  ADD CONSTRAINT "PlayerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MediaAsset"
  ADD CONSTRAINT "MediaAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "MediaAsset_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Stakeholder"
  ADD CONSTRAINT "Stakeholder_claimedByUserId_fkey" FOREIGN KEY ("claimedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Opportunity"
  ADD CONSTRAINT "Opportunity_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "Stakeholder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SavedOpportunity"
  ADD CONSTRAINT "SavedOpportunity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "SavedOpportunity_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OutreachRequest"
  ADD CONSTRAINT "OutreachRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "OutreachRequest_playerProfileId_fkey" FOREIGN KEY ("playerProfileId") REFERENCES "PlayerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "OutreachRequest_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "Stakeholder"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "OutreachRequest_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CreditLedger"
  ADD CONSTRAINT "CreditLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "CreditLedger_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AIInsight"
  ADD CONSTRAINT "AIInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "AIInsight_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ContentPost"
  ADD CONSTRAINT "ContentPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Comment"
  ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ContentPost"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "Comment_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ModerationEvent"
  ADD CONSTRAINT "ModerationEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
