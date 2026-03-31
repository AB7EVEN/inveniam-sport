import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import {
  AgeGateStatus,
  AgeVerificationStatus,
  BillingStatus,
  CommentStatus,
  InsightType,
  MediaAssetStatus,
  MediaAssetType,
  NotificationChannel,
  OpportunityStatus,
  OpportunityTrustLabel,
  OpportunityType,
  OutreachResponseState,
  OutreachStatus,
  PostVisibility,
  PrismaClient,
  StakeholderDeliveryMode,
  StakeholderVerificationStatus,
  SubscriptionStatus,
  UserRole
} from "../src/generated/prisma/client";
import {
  communityPosts,
  dashboardSummary,
  featuredOpportunities,
  outreachRequests,
  profileHighlights,
  sportPlans
} from "../src/lib/data/inveniam";
import { hashPassword, normalizeEmail } from "../src/lib/auth/password";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/inveniam_sport"
  })
});

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function startOfCycle() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

async function upsertPrimaryUsers() {
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL ?? "staff@inveniamsport.local");
  const adminPasswordHash = await hashPassword(process.env.ADMIN_PASSWORD ?? "ChangeMe123!");

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      ageGateStatus: AgeGateStatus.PASSED,
      ageVerificationStatus: AgeVerificationStatus.VERIFIED,
      billingStatus: BillingStatus.ACTIVE,
      trustScore: 0.98,
      lastSeenAt: new Date()
    },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      ageGateStatus: AgeGateStatus.PASSED,
      ageVerificationStatus: AgeVerificationStatus.VERIFIED,
      billingStatus: BillingStatus.ACTIVE,
      trustScore: 0.98,
      country: "US",
      lastSeenAt: new Date()
    }
  });

  const demoEmail = normalizeEmail(process.env.DEMO_USER_EMAIL ?? "demo@inveniamsport.local");
  const demoPasswordHash = await hashPassword(process.env.DEMO_USER_PASSWORD ?? "ChangeMe123!");

  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      passwordHash: demoPasswordHash,
      ageGateStatus: AgeGateStatus.PASSED,
      ageVerificationStatus: AgeVerificationStatus.VERIFIED,
      billingStatus: BillingStatus.ACTIVE,
      trustScore: 0.84,
      country: "US",
      lastSeenAt: new Date()
    },
    create: {
      email: demoEmail,
      passwordHash: demoPasswordHash,
      ageGateStatus: AgeGateStatus.PASSED,
      ageVerificationStatus: AgeVerificationStatus.VERIFIED,
      billingStatus: BillingStatus.ACTIVE,
      trustScore: 0.84,
      country: "US",
      lastSeenAt: new Date()
    }
  });

  return { admin, demoUser };
}

async function seedPlans() {
  for (const [index, plan] of sportPlans.entries()) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        description: plan.summary,
        benefits: plan.features,
        monthlyPriceCents: plan.monthlyPriceCents,
        annualPriceCents: plan.annualPriceCents,
        messageQuota: plan.slug === "basic" ? 5 : plan.slug === "advanced" ? 10 : 30,
        featuresJson: {
          badge: plan.badge,
          introCredits: plan.introCredits
        },
        sortOrder: index,
        isBundle: false,
        isActive: true,
        personaId: null
      },
      create: {
        slug: plan.slug,
        name: plan.name,
        description: plan.summary,
        benefits: plan.features,
        monthlyPriceCents: plan.monthlyPriceCents,
        annualPriceCents: plan.annualPriceCents,
        messageQuota: plan.slug === "basic" ? 5 : plan.slug === "advanced" ? 10 : 30,
        featuresJson: {
          badge: plan.badge,
          introCredits: plan.introCredits
        },
        sortOrder: index,
        isBundle: false,
        isActive: true
      }
    });
  }
}

async function seedProfile(userId: string) {
  const profile = await prisma.playerProfile.upsert({
    where: { userId },
    update: {
      displayName: profileHighlights.name,
      ageBand: profileHighlights.ageBand,
      nationality: profileHighlights.nationality,
      dominantFoot: profileHighlights.dominantFoot,
      primaryPosition: "Defensive Midfielder",
      secondaryPositions: ["Right Back"],
      heightCm: 180,
      currentStatus: profileHighlights.currentStatus,
      clubHistoryJson: [
        { club: "Portland City", level: "USL", season: "2025" },
        { club: "Southeast United", level: "MLS NEXT Pro", season: "2024" }
      ],
      videoLinks: [
        "https://example.com/highlight-reel",
        "https://example.com/full-match-sacramento"
      ],
      statisticsJson: {
        matches: 24,
        minutes: 1630,
        progressivePassesPer90: 6.1,
        duelWinRate: 0.58
      },
      availability: "Immediate",
      workAuthorization: profileHighlights.workAuth,
      agentRepresentationStatus: "Represented by Inveniam Sport",
      bio: profileHighlights.bio,
      completenessScore: dashboardSummary.profileCompletion,
      isPublic: true,
      publicShareToken: "demo-player-dossier"
    },
    create: {
      userId,
      displayName: profileHighlights.name,
      ageBand: profileHighlights.ageBand,
      nationality: profileHighlights.nationality,
      dominantFoot: profileHighlights.dominantFoot,
      primaryPosition: "Defensive Midfielder",
      secondaryPositions: ["Right Back"],
      heightCm: 180,
      currentStatus: profileHighlights.currentStatus,
      clubHistoryJson: [
        { club: "Portland City", level: "USL", season: "2025" },
        { club: "Southeast United", level: "MLS NEXT Pro", season: "2024" }
      ],
      videoLinks: [
        "https://example.com/highlight-reel",
        "https://example.com/full-match-sacramento"
      ],
      statisticsJson: {
        matches: 24,
        minutes: 1630,
        progressivePassesPer90: 6.1,
        duelWinRate: 0.58
      },
      availability: "Immediate",
      workAuthorization: profileHighlights.workAuth,
      agentRepresentationStatus: "Represented by Inveniam Sport",
      bio: profileHighlights.bio,
      completenessScore: dashboardSummary.profileCompletion,
      isPublic: true,
      publicShareToken: "demo-player-dossier"
    }
  });

  await prisma.mediaAsset.deleteMany({ where: { userId } });

  await prisma.mediaAsset.createMany({
    data: [
      {
        userId,
        profileId: profile.id,
        assetType: MediaAssetType.VIDEO_LINK,
        externalUrl: "https://example.com/highlight-reel",
        status: MediaAssetStatus.ACTIVE,
        metadataJson: { label: "2026 highlight reel" }
      },
      {
        userId,
        profileId: profile.id,
        assetType: MediaAssetType.VIDEO_LINK,
        externalUrl: "https://example.com/full-match-sacramento",
        status: MediaAssetStatus.ACTIVE,
        metadataJson: { label: "Full match vs. Sacramento" }
      },
      {
        userId,
        profileId: profile.id,
        assetType: MediaAssetType.PDF_CV,
        storagePath: "profiles/demo-player/football-cv.pdf",
        status: MediaAssetStatus.ACTIVE,
        metadataJson: { label: "Football CV PDF" }
      },
      {
        userId,
        profileId: profile.id,
        assetType: MediaAssetType.METRICS_FILE,
        storagePath: "profiles/demo-player/performance-metrics.csv",
        status: MediaAssetStatus.ACTIVE,
        metadataJson: { label: "Performance metrics CSV" }
      }
    ]
  });

  return profile;
}

async function seedSubscriptionAndCredits(userId: string) {
  const plan = await prisma.plan.findUniqueOrThrow({ where: { slug: "advanced" } });
  const cycleStart = startOfCycle();
  const cycleEnd = addDays(cycleStart, 30);

  const existing = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  const subscription = existing
    ? await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
          startedAt: cycleStart,
          renewsAt: cycleEnd,
          cycleStart,
          cycleEnd,
          providerCustomerId: `seed-customer-${userId}`,
          providerSubscriptionId: `seed-sub-${userId}`
        }
      })
    : await prisma.subscription.create({
        data: {
          userId,
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
          startedAt: cycleStart,
          renewsAt: cycleEnd,
          cycleStart,
          cycleEnd,
          providerCustomerId: `seed-customer-${userId}`,
          providerSubscriptionId: `seed-sub-${userId}`
        }
      });

  await prisma.creditLedger.deleteMany({ where: { userId } });
  await prisma.creditLedger.create({
    data: {
      userId,
      subscriptionId: subscription.id,
      cycleStart,
      cycleEnd,
      creditsTotal: dashboardSummary.creditsTotal,
      creditsUsed: dashboardSummary.creditsTotal - dashboardSummary.creditsRemaining,
      creditsReserved: 1,
      source: `subscription:${plan.slug}`
    }
  });

  return subscription;
}

async function seedStakeholdersAndOpportunities(adminUserId: string) {
  const stakeholderMap = new Map<string, { id: string }>();

  for (const item of featuredOpportunities) {
    const stakeholder = await prisma.stakeholder.upsert({
      where: { slug: slugify(item.orgName) },
      update: {
        orgName: item.orgName,
        contactName: item.orgName.includes("Sporting") ? "Head of Recruitment" : "Scouting Desk",
        roleTitle: "Recruitment Contact",
        geography: item.geography,
        positionGroups: [item.positionGroup],
        deliveryMode: item.orgName.includes("Network")
          ? StakeholderDeliveryMode.BOTH
          : StakeholderDeliveryMode.EMAIL_RELAY,
        preferenceJson: {
          maxWeeklyVolume: 5,
          positions: [item.positionGroup],
          geographies: [item.geography],
          acceptsMessages: true
        },
        verificationStatus: StakeholderVerificationStatus.VERIFIED,
        maxWeeklyVolume: 5,
        isAcceptingProfiles: true,
        claimedByUserId: null
      },
      create: {
        slug: slugify(item.orgName),
        orgName: item.orgName,
        contactName: item.orgName.includes("Sporting") ? "Head of Recruitment" : "Scouting Desk",
        roleTitle: "Recruitment Contact",
        geography: item.geography,
        positionGroups: [item.positionGroup],
        deliveryMode: item.orgName.includes("Network")
          ? StakeholderDeliveryMode.BOTH
          : StakeholderDeliveryMode.EMAIL_RELAY,
        preferenceJson: {
          maxWeeklyVolume: 5,
          positions: [item.positionGroup],
          geographies: [item.geography],
          acceptsMessages: true
        },
        verificationStatus: StakeholderVerificationStatus.VERIFIED,
        maxWeeklyVolume: 5,
        isAcceptingProfiles: true
      },
      select: { id: true }
    });

    stakeholderMap.set(item.orgName, stakeholder);
  }

  for (const item of featuredOpportunities) {
    const opportunityType =
      item.type === "Verified Opportunity"
        ? OpportunityType.VERIFIED_OPPORTUNITY
        : item.type === "Inferred Need"
          ? OpportunityType.INFERRED_NEED
          : item.type === "Event / Showcase"
            ? OpportunityType.EVENT_SHOWCASE
            : OpportunityType.OPEN_CALL;

    const status =
      item.status === "Open"
        ? OpportunityStatus.OPEN
        : item.status === "Reviewing"
          ? OpportunityStatus.REVIEWING
          : OpportunityStatus.CLOSING_SOON;

    await prisma.opportunity.upsert({
      where: { slug: item.id },
      update: {
        stakeholderId: stakeholderMap.get(item.orgName)?.id,
        createdById: adminUserId,
        opportunityType,
        title: item.title,
        orgName: item.orgName,
        positionGroup: item.positionGroup,
        geography: item.geography,
        level: item.level,
        eligibilityNotes: item.summary,
        trustLabel:
          item.trustLabel === "Verified"
            ? OpportunityTrustLabel.VERIFIED
            : OpportunityTrustLabel.INFERRED,
        confidence: item.trustLabel === "Inferred" ? item.fitScore : null,
        rationaleSnippet: item.rationale,
        sourceProvenance: item.trustLabel === "Verified" ? "Seeded admin curation" : "Manually reviewed inferred signal",
        freshnessExpiresAt: addDays(new Date(), item.status === "Closing Soon" ? 7 : 14),
        status
      },
      create: {
        slug: item.id,
        stakeholderId: stakeholderMap.get(item.orgName)?.id,
        createdById: adminUserId,
        opportunityType,
        title: item.title,
        orgName: item.orgName,
        positionGroup: item.positionGroup,
        geography: item.geography,
        level: item.level,
        eligibilityNotes: item.summary,
        trustLabel:
          item.trustLabel === "Verified"
            ? OpportunityTrustLabel.VERIFIED
            : OpportunityTrustLabel.INFERRED,
        confidence: item.trustLabel === "Inferred" ? item.fitScore : null,
        rationaleSnippet: item.rationale,
        sourceProvenance: item.trustLabel === "Verified" ? "Seeded admin curation" : "Manually reviewed inferred signal",
        freshnessExpiresAt: addDays(new Date(), item.status === "Closing Soon" ? 7 : 14),
        status
      }
    });
  }
}

async function seedEngagementData(params: {
  adminUserId: string;
  demoUserId: string;
  profileId: string;
}) {
  const { adminUserId, demoUserId, profileId } = params;

  const opportunities = await prisma.opportunity.findMany({
    orderBy: { createdAt: "asc" }
  });
  const opportunityByTitle = new Map(opportunities.map((item) => [item.title, item]));

  await prisma.savedOpportunity.deleteMany({ where: { userId: demoUserId } });
  for (const item of opportunities.slice(0, 2)) {
    await prisma.savedOpportunity.create({
      data: {
        userId: demoUserId,
        opportunityId: item.id
      }
    });
  }

  await prisma.outreachRequest.deleteMany({ where: { userId: demoUserId } });
  for (const request of outreachRequests) {
    const opportunity = opportunityByTitle.get(request.opportunity);
    if (!opportunity) {
      continue;
    }

    const stakeholder = await prisma.stakeholder.findFirstOrThrow({
      where: { orgName: request.recipient },
      select: { id: true, preferenceJson: true }
    });

    await prisma.outreachRequest.create({
      data: {
        userId: demoUserId,
        playerProfileId: profileId,
        stakeholderId: stakeholder.id,
        opportunityId: opportunity.id,
        messageBody:
          "Professional introduction request with profile summary, current availability, and recent video links.",
        assembledPacketUrl: "https://example.com/packets/demo-player.pdf",
        status:
          request.status === "Delivered"
            ? OutreachStatus.DELIVERED
            : request.status === "In review"
              ? OutreachStatus.IN_REVIEW
              : OutreachStatus.REJECTED,
        deliveredAt: request.status === "Delivered" ? new Date() : null,
        responseState:
          request.status === "Delivered"
            ? OutreachResponseState.RESPONDED
            : OutreachResponseState.NONE,
        moderationReason:
          request.status === "Needs edits" ? request.note : null,
        recipientSnapshotJson: stakeholder.preferenceJson ?? undefined,
        creditsReserved: request.status === "In review" ? 1 : 0,
        creditsConsumed: request.status === "Delivered" ? 1 : 0
      }
    });
  }

  await prisma.aIInsight.deleteMany({ where: { userId: demoUserId } });
  await prisma.aIInsight.createMany({
    data: [
      {
        userId: demoUserId,
        profileId,
        insightType: InsightType.PROFILE_COACH,
        inputSnapshotJson: {
          completenessScore: dashboardSummary.profileCompletion,
          missing: profileHighlights.tasks
        },
        outputJson: {
          summary: "Add evidence-rich media and minutes trend before sending additional introductions.",
          checklist: profileHighlights.tasks
        },
        confidence: 0.87
      },
      {
        userId: demoUserId,
        profileId,
        insightType: InsightType.CLUB_FIT,
        inputSnapshotJson: {
          primaryPosition: "Defensive Midfielder",
          geography: "United States"
        },
        outputJson: {
          fitBuckets: ["USL control-oriented sides", "MLS NEXT Pro hybrid fullback roles"],
          rationale: "Best fit increases when recent minutes and full-match footage are present."
        },
        confidence: 0.73
      }
    ]
  });

  for (const post of communityPosts) {
    await prisma.contentPost.upsert({
      where: { slug: post.id },
      update: {
        title: post.title,
        category: post.category,
        body: `${post.excerpt}\n\nThis seeded post mirrors the MVP community scope: announcements, roundups, and actionable guidance instead of noisy social chatter.`,
        visibility: PostVisibility.MEMBERS_ONLY,
        authorId: adminUserId,
        publishedAt: new Date()
      },
      create: {
        slug: post.id,
        title: post.title,
        category: post.category,
        body: `${post.excerpt}\n\nThis seeded post mirrors the MVP community scope: announcements, roundups, and actionable guidance instead of noisy social chatter.`,
        visibility: PostVisibility.MEMBERS_ONLY,
        authorId: adminUserId,
        publishedAt: new Date()
      }
    });
  }

  const posts = await prisma.contentPost.findMany({
    where: { slug: { in: communityPosts.map((post) => post.id) } },
    select: { id: true, slug: true }
  });

  await prisma.comment.deleteMany({
    where: {
      postId: { in: posts.map((post) => post.id) }
    }
  });

  for (const post of posts) {
    await prisma.comment.create({
      data: {
        postId: post.id,
        userId: demoUserId,
        profileId,
        body: `Following this ${post.slug.replace(/-/g, " ")} post closely. The trust-label framing is exactly what players need.`,
        status: CommentStatus.PUBLISHED
      }
    });
  }

  await prisma.notification.deleteMany({ where: { userId: demoUserId } });
  await prisma.notification.createMany({
    data: [
      {
        userId: demoUserId,
        channel: NotificationChannel.EMAIL,
        templateKey: "onboarding_complete",
        payloadJson: { nextStep: "Finish profile evidence and save opportunities." },
        sentAt: new Date()
      },
      {
        userId: demoUserId,
        channel: NotificationChannel.IN_APP,
        templateKey: "outreach_response",
        payloadJson: { opportunity: featuredOpportunities[0].title, state: "responded" },
        sentAt: new Date()
      }
    ]
  });

  await prisma.moderationEvent.deleteMany({
    where: { subjectType: "outreach_request", actorId: adminUserId }
  });
  await prisma.moderationEvent.create({
    data: {
      subjectType: "outreach_request",
      subjectId: "seeded-review",
      actorId: adminUserId,
      policyCode: "QUALITY_REVIEW",
      actionTaken: "APPROVED_WITH_FEEDBACK",
      notes: "Structured delivery maintained. Encouraged stronger work authorization detail in future packets."
    }
  });
}

async function seedFeatureFlags() {
  await prisma.featureFlag.upsert({
    where: { key: "new_purchases_enabled" },
    update: {
      description: "Allow checkout and plan changes during MVP validation.",
      isEnabled: true
    },
    create: {
      key: "new_purchases_enabled",
      description: "Allow checkout and plan changes during MVP validation.",
      isEnabled: true
    }
  });
}

async function main() {
  const { admin, demoUser } = await upsertPrimaryUsers();
  await seedPlans();
  const profile = await seedProfile(demoUser.id);
  await seedSubscriptionAndCredits(demoUser.id);
  await seedStakeholdersAndOpportunities(admin.id);
  await seedEngagementData({
    adminUserId: admin.id,
    demoUserId: demoUser.id,
    profileId: profile.id
  });
  await seedFeatureFlags();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
