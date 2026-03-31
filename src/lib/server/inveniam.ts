import "server-only";

import {
  CommentStatus,
  InsightType,
  OpportunityStatus,
  OpportunityTrustLabel,
  OutreachResponseState,
  OutreachStatus,
  SubscriptionStatus
} from "@/generated/prisma/client";
import {
  communityPosts as communityFallback,
  dashboardSummary as dashboardFallback,
  featuredOpportunities as opportunitiesFallback,
  outreachRequests as outreachFallback,
  profileHighlights as profileFallback,
  sportPlans as planFallback,
  type OpportunityItem,
  type SportPlan
} from "@/lib/data/inveniam";
import { prisma } from "@/lib/prisma";
import { trackEvent } from "@/lib/server/analytics";
import { notifyUser } from "@/lib/server/notifications";

const SPORT_PLAN_SLUGS = ["basic", "advanced", "elite"] as const;
const PROFILE_REQUIRED_FIELDS = [
  "displayName",
  "ageBand",
  "nationality",
  "dominantFoot",
  "primaryPosition",
  "currentStatus",
  "bio",
  "workAuthorization",
  "availability"
] as const;

function fallbackPlanMap() {
  return new Map(planFallback.map((plan) => [plan.slug, plan]));
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function computeProfileCompleteness(profile: {
  displayName?: string | null;
  ageBand?: string | null;
  nationality?: string | null;
  dominantFoot?: string | null;
  primaryPosition?: string | null;
  currentStatus?: string | null;
  bio?: string | null;
  workAuthorization?: string | null;
  availability?: string | null;
  secondaryPositions?: string[] | null;
  videoLinks?: string[] | null;
}) {
  let score = 0;

  for (const field of PROFILE_REQUIRED_FIELDS) {
    if (profile[field]) {
      score += 9;
    }
  }

  if ((profile.secondaryPositions ?? []).length) {
    score += 9;
  }

  if ((profile.videoLinks ?? []).length) {
    score += 10;
  }

  return Math.min(score, 100);
}

export async function ensurePlayerProfile(userId: string) {
  const existing = await prisma.playerProfile.findUnique({
    where: { userId },
    include: {
      mediaAssets: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (existing) {
    return existing;
  }

  return prisma.playerProfile.create({
    data: {
      userId,
      publicShareToken: `player-${userId.slice(0, 8)}`,
      completenessScore: 0
    },
    include: {
      mediaAssets: {
        orderBy: { createdAt: "asc" }
      }
    }
  });
}

export async function listSportPlans(): Promise<SportPlan[]> {
  try {
    const plans = await prisma.plan.findMany({
      where: {
        slug: { in: [...SPORT_PLAN_SLUGS] },
        isActive: true
      },
      orderBy: [{ sortOrder: "asc" }, { monthlyPriceCents: "asc" }]
    });

    const fallback = fallbackPlanMap();

    return plans.map((plan) => {
      const fallbackPlan = fallback.get(plan.slug);
      return {
        slug: plan.slug,
        name: plan.name,
        monthlyPriceCents: plan.monthlyPriceCents,
        annualPriceCents: plan.annualPriceCents ?? fallbackPlan?.annualPriceCents,
        introCredits:
          typeof plan.featuresJson === "object" && plan.featuresJson && "introCredits" in plan.featuresJson
            ? String((plan.featuresJson as { introCredits?: string }).introCredits ?? "")
            : fallbackPlan?.introCredits ?? `${plan.messageQuota} introduction credits / month`,
        badge:
          typeof plan.featuresJson === "object" && plan.featuresJson && "badge" in plan.featuresJson
            ? String((plan.featuresJson as { badge?: string }).badge ?? "")
            : fallbackPlan?.badge ?? "Member plan",
        summary: plan.description,
        features: plan.benefits
      };
    });
  } catch {
    return planFallback;
  }
}

function mapOpportunity(
  opportunity: {
    id: string;
    slug: string;
    title: string;
    orgName: string;
    positionGroup: string;
    geography: string;
    level: string;
    eligibilityNotes: string | null;
    trustLabel: OpportunityTrustLabel;
    confidence: number | null;
    rationaleSnippet: string | null;
    freshnessExpiresAt: Date;
    status: OpportunityStatus;
    opportunityType: string;
    savedBy?: Array<{ userId: string }>;
  },
  userId?: string
) {
  const typeMap: Record<string, OpportunityItem["type"]> = {
    VERIFIED_OPPORTUNITY: "Verified Opportunity",
    INFERRED_NEED: "Inferred Need",
    EVENT_SHOWCASE: "Event / Showcase",
    OPEN_CALL: "Open Call"
  };
  const statusMap: Record<OpportunityStatus, OpportunityItem["status"]> = {
    DRAFT: "Reviewing",
    OPEN: "Open",
    REVIEWING: "Reviewing",
    CLOSING_SOON: "Closing Soon",
    ARCHIVED: "Closing Soon"
  };
  const now = new Date();
  const days = Math.max(
    0,
    Math.ceil((opportunity.freshnessExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  const trustLabel: OpportunityItem["trustLabel"] =
    opportunity.trustLabel === OpportunityTrustLabel.VERIFIED ? "Verified" : "Inferred";

  return {
    id: opportunity.id,
    slug: opportunity.slug,
    title: opportunity.title,
    type: typeMap[opportunity.opportunityType] ?? "Verified Opportunity",
    trustLabel,
    orgName: opportunity.orgName,
    geography: opportunity.geography,
    level: opportunity.level,
    positionGroup: opportunity.positionGroup,
    freshness: days > 0 ? `Fresh through ${opportunity.freshnessExpiresAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "Needs refresh",
    status: statusMap[opportunity.status],
    fitScore: opportunity.confidence ?? 78,
    summary: opportunity.eligibilityNotes ?? "Curated opportunity for professional footballers.",
    rationale:
      opportunity.rationaleSnippet ??
      "Opportunity fit is based on profile strength, position, geography, and current visibility.",
    isSaved: Boolean(userId && opportunity.savedBy?.some((saved) => saved.userId === userId))
  };
}

export async function listFeaturedOpportunities(userId?: string) {
  try {
    const opportunities = await prisma.opportunity.findMany({
      where: {
        status: { not: OpportunityStatus.ARCHIVED },
        freshnessExpiresAt: { gte: new Date() }
      },
      include: {
        savedBy: userId
          ? {
              where: { userId },
              select: { userId: true }
            }
          : false
      },
      orderBy: [{ trustLabel: "asc" }, { freshnessExpiresAt: "asc" }],
      take: 6
    });

    if (!opportunities.length) {
      return opportunitiesFallback.map((item) => ({ ...item, slug: item.id, isSaved: false }));
    }

    return opportunities.map((item) => mapOpportunity(item, userId));
  } catch {
    return opportunitiesFallback.map((item) => ({ ...item, slug: item.id, isSaved: false }));
  }
}

export async function listOpportunitiesForUser(
  userId: string,
  filters?: { position?: string; trust?: string; status?: string }
) {
  const where = {
    status: { not: OpportunityStatus.ARCHIVED },
    freshnessExpiresAt: { gte: new Date() },
    ...(filters?.position && filters.position !== "All"
      ? { positionGroup: filters.position }
      : {}),
    ...(filters?.trust && filters.trust !== "All"
      ? {
          trustLabel:
            filters.trust === "Verified"
              ? OpportunityTrustLabel.VERIFIED
              : OpportunityTrustLabel.INFERRED
        }
      : {})
  } as const;

  const opportunities = await prisma.opportunity.findMany({
    where,
    include: {
      savedBy: {
        where: { userId },
        select: { userId: true }
      }
    },
    orderBy: [{ trustLabel: "asc" }, { freshnessExpiresAt: "asc" }]
  });

  return opportunities.map((item) => mapOpportunity(item, userId));
}

export async function getLatestCreditLedger(userId: string) {
  return prisma.creditLedger.findFirst({
    where: { userId },
    orderBy: { cycleEnd: "desc" }
  });
}

export async function getCurrentSubscriptionSummary(userId: string) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: {
        in: [
          SubscriptionStatus.ACTIVE,
          SubscriptionStatus.PAST_DUE,
          SubscriptionStatus.INCOMPLETE,
          SubscriptionStatus.CANCELED
        ]
      }
    },
    include: { plan: true },
    orderBy: [{ renewsAt: "desc" }, { createdAt: "desc" }]
  });
}

export async function getCurrentPlanSummary(userId: string) {
  const subscription = await getCurrentSubscriptionSummary(userId);

  return subscription?.plan ?? null;
}

export async function getDashboardWorkspace(userId: string) {
  const [profile, ledger, plan, opportunities, requests, posts, notifications, savedCount] =
    await Promise.all([
      ensurePlayerProfile(userId),
      getLatestCreditLedger(userId),
      getCurrentPlanSummary(userId),
      listFeaturedOpportunities(userId),
      prisma.outreachRequest.findMany({
        where: { userId },
        include: {
          stakeholder: true,
          opportunity: true
        },
        orderBy: { updatedAt: "desc" },
        take: 5
      }),
      prisma.contentPost.findMany({
        where: { publishedAt: { not: null } },
        include: {
          _count: {
            select: { comments: true }
          },
          author: { select: { email: true } }
        },
        orderBy: { publishedAt: "desc" },
        take: 3
      }),
      prisma.notification.count({ where: { userId, readAt: null } }),
      prisma.savedOpportunity.count({ where: { userId } })
    ]);

  return {
    summary: {
      profileCompletion: profile.completenessScore,
      currentPlan: plan?.name ?? dashboardFallback.currentPlan,
      creditsRemaining: ledger
        ? Math.max(ledger.creditsTotal - ledger.creditsUsed - ledger.creditsReserved, 0)
        : dashboardFallback.creditsRemaining,
      creditsTotal: ledger?.creditsTotal ?? dashboardFallback.creditsTotal,
      unreadResponses: notifications,
      savedOpportunities: savedCount,
      nextReviewWindow:
        requests.find((request) => request.status === OutreachStatus.IN_REVIEW)?.updatedAt.toLocaleString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
          }
        ) ?? dashboardFallback.nextReviewWindow
    },
    opportunities,
    requests: requests.length
      ? requests.map((request) => ({
          id: request.id,
          recipient: request.stakeholder.orgName,
          opportunity: request.opportunity?.title ?? "General introduction request",
          status:
            request.status === OutreachStatus.DELIVERED
              ? "Delivered"
              : request.status === OutreachStatus.IN_REVIEW
                ? "In review"
                : request.status === OutreachStatus.REJECTED
                  ? "Needs edits"
                  : "Queued",
          updatedAt: request.updatedAt.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
          }),
          note:
            request.moderationReason ??
            (request.status === OutreachStatus.DELIVERED
              ? "Delivered through controlled relay with the current dossier packet."
              : "Currently moving through the moderation and delivery workflow.")
        }))
      : outreachFallback,
    posts: posts.length
      ? posts.map((post) => ({
          id: post.id,
          category: post.category,
          title: post.title,
          excerpt: post.body.split("\n")[0] ?? post.body,
          author: post.author.email,
          publishedAt:
            post.publishedAt?.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric"
            }) ?? "Draft",
          comments: post._count.comments
        }))
      : communityFallback
  };
}

export async function getProfileWorkspace(userId: string) {
  const profile = await ensurePlayerProfile(userId);
  const media = profile.mediaAssets.map((asset) => ({
    id: asset.id,
    label:
      typeof asset.metadataJson === "object" && asset.metadataJson && "label" in asset.metadataJson
        ? String((asset.metadataJson as { label?: string }).label ?? asset.assetType)
        : asset.assetType,
    type: asset.assetType,
    externalUrl: asset.externalUrl,
    storagePath: asset.storagePath
  }));

  return {
    profile,
    media
  };
}

export async function upsertProfile(userId: string, input: {
  displayName?: string;
  ageBand?: string;
  nationality?: string;
  dominantFoot?: string;
  primaryPosition?: string;
  secondaryPositions?: string[];
  heightCm?: number | null;
  currentStatus?: string;
  availability?: string;
  workAuthorization?: string;
  bio?: string;
  videoLinks?: string[];
  agentRepresentationStatus?: string;
}) {
  const completenessScore = computeProfileCompleteness(input);

  const profile = await ensurePlayerProfile(userId);
  const updated = await prisma.playerProfile.update({
    where: { id: profile.id },
    data: {
      displayName: input.displayName,
      ageBand: input.ageBand,
      nationality: input.nationality,
      dominantFoot: input.dominantFoot,
      primaryPosition: input.primaryPosition,
      secondaryPositions: input.secondaryPositions ?? [],
      heightCm: input.heightCm,
      currentStatus: input.currentStatus,
      availability: input.availability,
      workAuthorization: input.workAuthorization,
      bio: input.bio,
      videoLinks: input.videoLinks ?? [],
      agentRepresentationStatus: input.agentRepresentationStatus,
      completenessScore,
      isPublic: completenessScore >= 85,
      publicShareToken: profile.publicShareToken ?? `player-${userId.slice(0, 8)}`
    }
  });

  await trackEvent({
    eventName: "profile_updated",
    category: "ENGAGEMENT",
    userId,
    metadata: {
      completenessScore
    }
  });

  return updated;
}

export async function addMediaAsset(userId: string, input: {
  assetType: "VIDEO_LINK" | "PDF_CV" | "IMAGE" | "METRICS_FILE";
  externalUrl?: string;
  storagePath?: string;
  label?: string;
}) {
  const profile = await ensurePlayerProfile(userId);

  return prisma.mediaAsset.create({
    data: {
      userId,
      profileId: profile.id,
      assetType: input.assetType,
      externalUrl: input.externalUrl,
      storagePath: input.storagePath,
      metadataJson: { label: input.label },
      status: "ACTIVE"
    }
  });
}

export async function toggleSavedOpportunity(userId: string, opportunityId: string) {
  const existing = await prisma.savedOpportunity.findUnique({
    where: {
      userId_opportunityId: {
        userId,
        opportunityId
      }
    }
  });

  if (existing) {
    await prisma.savedOpportunity.delete({ where: { id: existing.id } });
    return { saved: false };
  }

  await prisma.savedOpportunity.create({
    data: {
      userId,
      opportunityId
    }
  });

  return { saved: true };
}

export async function listOutreachForUser(userId: string) {
  const requests = await prisma.outreachRequest.findMany({
    where: { userId },
    include: {
      stakeholder: true,
      opportunity: true
    },
    orderBy: { updatedAt: "desc" }
  });

  return requests.map((request) => ({
    id: request.id,
    recipient: request.stakeholder.orgName,
    opportunity: request.opportunity?.title ?? "General introduction request",
    status:
      request.status === OutreachStatus.DELIVERED
        ? "Delivered"
        : request.status === OutreachStatus.IN_REVIEW
          ? "In review"
          : request.status === OutreachStatus.REJECTED
            ? "Needs edits"
            : "Queued",
    updatedAt: request.updatedAt.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }),
    note:
      request.moderationReason ??
      (request.status === OutreachStatus.DELIVERED
        ? "Delivered with the assembled packet and current profile summary."
        : "Awaiting queue progression or moderator review.")
  }));
}

export async function submitOutreachRequest(params: {
  userId: string;
  opportunityId: string;
  messageBody: string;
}) {
  const { userId, opportunityId, messageBody } = params;
  const [profile, opportunity, ledger] = await Promise.all([
    ensurePlayerProfile(userId),
    prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { stakeholder: true }
    }),
    getLatestCreditLedger(userId)
  ]);

  if (!opportunity || !opportunity.stakeholder) {
    throw new Error("Opportunity is no longer available.");
  }

  if (profile.completenessScore < 85) {
    throw new Error("Complete at least 85% of your profile before requesting introductions.");
  }

  if (!ledger || ledger.creditsTotal - ledger.creditsUsed - ledger.creditsReserved <= 0) {
    throw new Error("No introduction credits are currently available.");
  }

  const status =
    opportunity.trustLabel === OpportunityTrustLabel.INFERRED
      ? OutreachStatus.IN_REVIEW
      : OutreachStatus.QUEUED;

  const request = await prisma.outreachRequest.create({
    data: {
      userId,
      playerProfileId: profile.id,
      stakeholderId: opportunity.stakeholder.id,
      opportunityId: opportunity.id,
      messageBody,
      assembledPacketUrl: `https://example.com/packets/${toSlug(profile.displayName ?? userId)}.pdf`,
      status,
      responseState: OutreachResponseState.NONE,
      recipientSnapshotJson: opportunity.stakeholder.preferenceJson ?? undefined,
      creditsReserved: 1
    }
  });

  await prisma.creditLedger.update({
    where: { id: ledger.id },
    data: {
      creditsReserved: ledger.creditsReserved + 1
    }
  });

  await notifyUser({
    userId,
    templateKey: "outreach_submitted",
    payload: {
      opportunity: opportunity.title,
      status
    },
    sendEmail: true
  });

  await trackEvent({
    eventName: "outreach_submitted",
    category: "ENGAGEMENT",
    userId,
    metadata: {
      opportunityId,
      status
    }
  });

  return request;
}

export async function listCommunityPostsWithCounts() {
  const posts = await prisma.contentPost.findMany({
    where: { publishedAt: { not: null } },
    include: {
      author: { select: { email: true } },
      _count: { select: { comments: true } }
    },
    orderBy: { publishedAt: "desc" }
  });

  if (!posts.length) {
    return communityFallback;
  }

  return posts.map((post) => ({
    id: post.id,
    category: post.category,
    title: post.title,
    excerpt: post.body.split("\n")[0] ?? post.body,
    author: post.author.email,
    publishedAt:
      post.publishedAt?.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      }) ?? "Draft",
    comments: post._count.comments
  }));
}

export async function addCommunityComment(userId: string, postId: string, body: string) {
  const profile = await ensurePlayerProfile(userId);
  const comment = await prisma.comment.create({
    data: {
      postId,
      userId,
      profileId: profile.id,
      body,
      status: CommentStatus.PUBLISHED
    }
  });

  await trackEvent({
    eventName: "community_comment_created",
    category: "ENGAGEMENT",
    userId,
    metadata: { postId }
  });

  return comment;
}

export async function listNotificationsForUser(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId }
  });

  if (!notification) {
    throw new Error("Notification not found.");
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() }
  });
}

export async function buildProfileCoach(userId: string) {
  const profile = await ensurePlayerProfile(userId);
  const missing = PROFILE_REQUIRED_FIELDS.filter((field) => !profile[field]);
  const output = {
    score: profile.completenessScore,
    checklist: [
      ...missing.map((field) => `Add ${field.replace(/[A-Z]/g, (char) => ` ${char.toLowerCase()}`)}.`),
      ...(profile.videoLinks.length ? [] : ["Attach a highlight reel and at least one full-match clip."])
    ],
    summary:
      profile.completenessScore >= 85
        ? "Your dossier is credible enough for outreach. Keep refreshing media and recent minutes evidence."
        : "Close the missing core fields before spending more introduction credits."
  };

  const insight = await prisma.aIInsight.create({
    data: {
      userId,
      profileId: profile.id,
      insightType: InsightType.PROFILE_COACH,
      inputSnapshotJson: {
        completenessScore: profile.completenessScore,
        missing
      },
      outputJson: output,
      confidence: 0.86
    }
  });

  return {
    id: insight.id,
    ...output,
    confidence: 0.86
  };
}

export async function buildClubFit(userId: string) {
  const profile = await ensurePlayerProfile(userId);
  const opportunities = await prisma.opportunity.findMany({
    where: {
      status: { not: OpportunityStatus.ARCHIVED },
      freshnessExpiresAt: { gte: new Date() }
    },
    orderBy: [{ trustLabel: "asc" }, { freshnessExpiresAt: "asc" }],
    take: 5
  });

  const fitBuckets = opportunities.map((opportunity) => ({
    title: opportunity.title,
    reason:
      opportunity.positionGroup === profile.primaryPosition ||
      profile.secondaryPositions.includes(opportunity.positionGroup)
        ? "Strong positional overlap and geography match."
        : "Useful exploratory fit with slightly weaker positional alignment.",
    matchScore:
      opportunity.positionGroup === profile.primaryPosition ||
      profile.secondaryPositions.includes(opportunity.positionGroup)
        ? 87
        : 71
  }));

  const insight = await prisma.aIInsight.create({
    data: {
      userId,
      profileId: profile.id,
      insightType: InsightType.CLUB_FIT,
      inputSnapshotJson: {
        primaryPosition: profile.primaryPosition,
        geography: profile.nationality
      },
      outputJson: { fitBuckets },
      confidence: 0.74
    }
  });

  return {
    id: insight.id,
    fitBuckets,
    confidence: 0.74
  };
}

export async function buildMessageAssist(params: {
  userId: string;
  opportunityId: string;
  draft?: string;
}) {
  const { userId, opportunityId, draft } = params;
  const [profile, opportunity] = await Promise.all([
    ensurePlayerProfile(userId),
    prisma.opportunity.findUnique({ where: { id: opportunityId } })
  ]);

  if (!opportunity) {
    throw new Error("Opportunity not found.");
  }

  const improvedDraft = `Hello ${opportunity.orgName},\n\nI am reaching out through Inveniam Sport to express interest in ${opportunity.title}. I currently profile as a ${profile.primaryPosition ?? "player"} with immediate availability, current media evidence, and work authorization details ready for review.\n\nI would value the opportunity to be considered if my background matches your current needs.\n\nThank you for your time.\n${profile.displayName ?? "Inveniam Sport member"}`;

  const insight = await prisma.aIInsight.create({
    data: {
      userId,
      profileId: profile.id,
      insightType: InsightType.MESSAGE_ASSIST,
      inputSnapshotJson: {
        opportunityId,
        draft
      },
      outputJson: {
        draft: improvedDraft,
        guardrails: [
          "Do not imply guaranteed access or club intent.",
          "Keep claims tied to evidence in the profile."
        ]
      },
      confidence: 0.79
    }
  });

  return {
    id: insight.id,
    draft: improvedDraft,
    confidence: 0.79
  };
}

export async function getAdminQueueSnapshot() {
  const [outreachQueue, freshOpportunities, flaggedComments] = await Promise.all([
    prisma.outreachRequest.findMany({
      where: { status: { in: [OutreachStatus.IN_REVIEW, OutreachStatus.QUEUED] } },
      include: {
        stakeholder: true,
        opportunity: true,
        user: true
      },
      orderBy: { createdAt: "asc" },
      take: 10
    }),
    prisma.opportunity.findMany({
      where: {
        status: { in: [OpportunityStatus.OPEN, OpportunityStatus.CLOSING_SOON, OpportunityStatus.REVIEWING] }
      },
      orderBy: { freshnessExpiresAt: "asc" },
      take: 10
    }),
    prisma.comment.findMany({
      where: { status: { in: [CommentStatus.FLAGGED, CommentStatus.HIDDEN] } },
      include: {
        post: true,
        user: true
      },
      orderBy: { updatedAt: "desc" },
      take: 10
    })
  ]);

  return {
    outreachQueue,
    freshOpportunities,
    flaggedComments
  };
}

export async function getProfilePreviewByToken(token: string) {
  const profile = await prisma.playerProfile.findFirst({
    where: { publicShareToken: token, isPublic: true },
    include: {
      user: {
        select: { id: true, email: true }
      },
      mediaAssets: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  return profile;
}

export function getFallbackProfileWorkspace() {
  return {
    profile: {
      displayName: profileFallback.name,
      ageBand: profileFallback.ageBand,
      nationality: profileFallback.nationality,
      dominantFoot: profileFallback.dominantFoot,
      primaryPosition: "Defensive Midfielder",
      secondaryPositions: ["Right Back"],
      heightCm: 180,
      currentStatus: profileFallback.currentStatus,
      availability: "Immediate",
      bio: profileFallback.bio,
      workAuthorization: profileFallback.workAuth,
      videoLinks: [
        "https://example.com/highlight-reel",
        "https://example.com/full-match-sacramento"
      ],
      agentRepresentationStatus: "Represented by Inveniam Sport",
      completenessScore: dashboardFallback.profileCompletion,
      publicShareToken: "demo-player-dossier"
    },
    media: profileFallback.media.map((item, index) => ({
      id: `fallback-${index}`,
      label: item,
      type: "ASSET",
      externalUrl: null,
      storagePath: null
    }))
  };
}
