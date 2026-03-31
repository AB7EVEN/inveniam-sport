export type SportPlan = {
  slug: string;
  name: string;
  monthlyPriceCents: number;
  annualPriceCents?: number;
  introCredits: string;
  badge: string;
  summary: string;
  features: string[];
};

export type OpportunityItem = {
  id: string;
  title: string;
  type: "Verified Opportunity" | "Inferred Need" | "Event / Showcase" | "Open Call";
  trustLabel: "Verified" | "Inferred";
  orgName: string;
  geography: string;
  level: string;
  positionGroup: string;
  freshness: string;
  status: "Open" | "Reviewing" | "Closing Soon";
  fitScore: number;
  summary: string;
  rationale: string;
};

export type CommunityPost = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  comments: number;
};

export type OutreachRequest = {
  id: string;
  recipient: string;
  opportunity: string;
  status: "Delivered" | "In review" | "Needs edits" | "Queued";
  updatedAt: string;
  note: string;
};

export type AdminQueueItem = {
  id: string;
  type: "Outreach" | "Opportunity" | "Stakeholder" | "Comment";
  subject: string;
  risk: "Low" | "Medium" | "High";
  owner: string;
  sla: string;
};

export const trustBannerText =
  "Built for serious 18+ footballers. Outreach is credit-based, recipient-controlled, and moderated before delivery when risk signals require review.";

export const launchMetrics = [
  {
    label: "Qualified introductions",
    value: "127",
    detail: "Tracked across the current pilot-style delivery model."
  },
  {
    label: "Fresh opportunities",
    value: "41",
    detail: "Verified opportunities and inferred needs with freshness windows."
  },
  {
    label: "Stakeholder response rate",
    value: "29%",
    detail: "Protected by recipient controls and manual queue review."
  },
  {
    label: "Target profile completion",
    value: "85%+",
    detail: "Profile quality gates outreach access inside the member app."
  }
] as const;

export const productPrinciples = [
  "Premium over noisy. The product should feel curated, serious, and football-native.",
  "Recipient trust is sacred. Clubs and stakeholders control what reaches them and how often.",
  "Profiles before outreach. Credible presentation unlocks access.",
  "AI supports judgment with inspectable outputs and visible rationale.",
  "Launch fast on the web, prove value, then extend to mobile."
] as const;

export const launchSteps = [
  {
    title: "Complete your dossier",
    body: "Build a professional player profile with football CV, video links, availability, work authorization, and bio."
  },
  {
    title: "Discover curated opportunities",
    body: "Browse verified openings, inferred positional needs, events, and open calls filtered by position, geography, and level."
  },
  {
    title: "Request introductions responsibly",
    body: "Use plan-based credits to submit a structured introduction packet through moderated delivery channels."
  },
  {
    title: "Improve with insight and community",
    body: "Use AI coaching, member content, office hours, and comments to sharpen profile quality and decision making."
  }
] as const;

export const sportPlans: SportPlan[] = [
  {
    slug: "basic",
    name: "Basic",
    monthlyPriceCents: 1000,
    introCredits: "5 introduction credits / month",
    badge: "Best for first-time applicants",
    summary: "A streamlined membership for players who need a polished profile, curated opportunities, and a disciplined starting point.",
    features: [
      "Professional player profile and public dossier link",
      "Opportunity browsing, filters, and saved opportunities",
      "Member announcements and weekly roundups",
      "Email notifications for new matches and queue updates"
    ]
  },
  {
    slug: "advanced",
    name: "Advanced",
    monthlyPriceCents: 1500,
    introCredits: "10 introduction credits / month",
    badge: "Most balanced plan",
    summary: "Adds AI coaching and better decision support for serious players preparing repeated, high-quality submissions.",
    features: [
      "Everything in Basic",
      "AI profile coach with structured improvement checklist",
      "AI club-fit suggestions and inferred need signals",
      "AI message assist for outreach drafts"
    ]
  },
  {
    slug: "elite",
    name: "Elite",
    monthlyPriceCents: 2000,
    annualPriceCents: 15000,
    introCredits: "Fair-use outbound with default soft cap of 30 delivered introductions / cycle",
    badge: "Priority review and visibility",
    summary: "Designed for players who need the fastest review path, stronger signal amplification, and premium curation treatment.",
    features: [
      "Everything in Advanced",
      "Priority queueing and faster human review",
      "Advanced opportunity alerts and profile visibility boosts",
      "Elite annual option with monthly fair-use allowances"
    ]
  }
];

export const sponsorCards = [
  {
    slug: "training-lab",
    label: "Founding sponsor",
    title: "Portland Performance Lab",
    body: "High-trust sponsor placement for recovery, analysis, and elite movement work aimed at serious footballers.",
    href: "#contact",
    cta: "Become a sponsor"
  },
  {
    slug: "boot-room",
    label: "Member partner",
    title: "Boot Room Media",
    body: "Feature interviews, weekly opportunity drops, and coach-facing storytelling designed for player credibility.",
    href: "#contact",
    cta: "Advertise with us"
  },
  {
    slug: "travel",
    label: "Travel partner",
    title: "Matchday Travel Co.",
    body: "Targeted ad inventory for showcases, combines, and player movement between trial events and club visits.",
    href: "#contact",
    cta: "See placements"
  }
] as const;

export const featuredOpportunities: OpportunityItem[] = [
  {
    id: "opp-verified-winger-texas",
    title: "USL Academy-linked winger opening",
    type: "Verified Opportunity",
    trustLabel: "Verified",
    orgName: "South Coast Sporting Group",
    geography: "Texas, USA",
    level: "USL / Pro pathway",
    positionGroup: "Winger",
    freshness: "Fresh through Apr 12",
    status: "Open",
    fitScore: 92,
    summary: "A verified opening for a high-motor wide player with strong transition output and availability for immediate review.",
    rationale: "Matches right-sided attacking profile, recent minutes trend, and video evidence already present in the dossier."
  },
  {
    id: "opp-inferred-cb-ontario",
    title: "Depth signal at center back",
    type: "Inferred Need",
    trustLabel: "Inferred",
    orgName: "Ontario Lakes FC",
    geography: "Ontario, Canada",
    level: "League One / reserve depth",
    positionGroup: "Center Back",
    freshness: "Signal reviewed Mar 29",
    status: "Reviewing",
    fitScore: 81,
    summary: "Inferred need based on public departures, recent match loads, and manually reviewed roster pressure.",
    rationale: "Displayed with rationale and confidence only; no implication of confirmed club intent."
  },
  {
    id: "opp-showcase-miami",
    title: "Miami pro showcase weekend",
    type: "Event / Showcase",
    trustLabel: "Verified",
    orgName: "Atlantic Talent Circuit",
    geography: "Florida, USA",
    level: "Showcase",
    positionGroup: "All positions",
    freshness: "Registration closes Apr 18",
    status: "Closing Soon",
    fitScore: 76,
    summary: "Curated event with vetted operators and limited slots for players who need a controlled exposure environment.",
    rationale: "Good fit for players still building club-side access and needing verified evaluation environments."
  },
  {
    id: "opp-open-call-midwest",
    title: "Open call for versatile fullbacks",
    type: "Open Call",
    trustLabel: "Verified",
    orgName: "Midwest Football Network",
    geography: "Illinois, USA",
    level: "Semi-pro / pathway",
    positionGroup: "Fullback",
    freshness: "Published Mar 28",
    status: "Open",
    fitScore: 88,
    summary: "A verified general submission request for dynamic fullbacks with strong repeat-sprint profile and work authorization in place.",
    rationale: "Profile fit rises when availability, dominant foot, and recent match rhythm are complete."
  }
];

export const communityPosts: CommunityPost[] = [
  {
    id: "post-weekly-roundup",
    category: "Weekly roundup",
    title: "This week's most actionable opportunities for U.S.-based 18+ players",
    excerpt: "A high-signal digest covering verified fullback, winger, and showcase openings with clear freshness and trust labels.",
    author: "Inveniam Staff",
    publishedAt: "March 29, 2026",
    comments: 14
  },
  {
    id: "post-office-hours",
    category: "Office hours",
    title: "How to make your dossier credible before using your first introduction credit",
    excerpt: "A practical session on profile thresholds, media proof, and how recipient controls shape what gets delivered.",
    author: "Arun Basuljevic",
    publishedAt: "March 27, 2026",
    comments: 9
  },
  {
    id: "post-ai-coach",
    category: "AI insight",
    title: "Using profile coach feedback without sounding inflated or scripted",
    excerpt: "Keep AI outputs structured and professional. The best profiles use them to tighten evidence, not exaggerate outcomes.",
    author: "Member Success",
    publishedAt: "March 25, 2026",
    comments: 22
  }
];

export const dashboardSummary = {
  profileCompletion: 86,
  currentPlan: "Advanced",
  creditsRemaining: 7,
  creditsTotal: 10,
  unreadResponses: 2,
  savedOpportunities: 11,
  nextReviewWindow: "Today, 5:00 PM ET"
} as const;

export const profileHighlights = {
  name: "Arun B.",
  role: "Defensive Midfielder / Right Back",
  location: "Portland, Oregon",
  ageBand: "18-24",
  nationality: "United States / Serbia",
  workAuth: "U.S. passport, Canadian eligible",
  dominantFoot: "Right",
  currentStatus: "Free agent",
  bio:
    "Ball-secure midfielder with pro experience, strong scanning habits, and the flexibility to cover as an inverted right back when the game model demands control in buildout.",
  tasks: [
    "Add last 10-match minutes trend to unlock stronger club-fit scoring.",
    "Upload updated PDF football CV with 2026 contact details.",
    "Attach one more full-match clip for stakeholder review packets."
  ],
  media: [
    "2026 highlight reel",
    "Full match vs. Sacramento",
    "Football CV PDF",
    "Performance metrics CSV"
  ]
} as const;

export const outreachRequests: OutreachRequest[] = [
  {
    id: "req-1",
    recipient: "South Coast Sporting Group",
    opportunity: "USL Academy-linked winger opening",
    status: "Delivered",
    updatedAt: "Mar 29, 2026 · 4:32 PM",
    note: "Delivered through relay with full dossier packet and video links attached."
  },
  {
    id: "req-2",
    recipient: "Ontario Lakes FC",
    opportunity: "Depth signal at center back",
    status: "In review",
    updatedAt: "Mar 29, 2026 · 2:10 PM",
    note: "Queued for human review because inferred need submissions require extra trust checks."
  },
  {
    id: "req-3",
    recipient: "Midwest Football Network",
    opportunity: "Open call for versatile fullbacks",
    status: "Needs edits",
    updatedAt: "Mar 28, 2026 · 10:02 AM",
    note: "Add work authorization detail and replace vague phrasing in the note before resubmitting."
  }
];

export const adminQueue: AdminQueueItem[] = [
  {
    id: "queue-1",
    type: "Outreach",
    subject: "Elite submission to Atlantic Talent Circuit",
    risk: "Medium",
    owner: "Ops West",
    sla: "1h 20m"
  },
  {
    id: "queue-2",
    type: "Opportunity",
    subject: "Renew inferred need freshness for Ontario Lakes FC",
    risk: "Low",
    owner: "Data Desk",
    sla: "Today"
  },
  {
    id: "queue-3",
    type: "Stakeholder",
    subject: "Verify inbox preferences for new Northeast scout",
    risk: "High",
    owner: "Trust Team",
    sla: "35m"
  },
  {
    id: "queue-4",
    type: "Comment",
    subject: "Review flagged office-hours thread reply",
    risk: "Medium",
    owner: "Community",
    sla: "2h 10m"
  }
];

export const faqs = [
  {
    question: "Does Elite mean unlimited messaging?",
    answer:
      "No. Elite means unlimited access to premium platform features, with outbound delivery still governed by fair-use limits, recipient preferences, and trust controls."
  },
  {
    question: "When are introduction credits deducted?",
    answer:
      "Only after a submission is actually delivered. Drafting, blocked preferences, or rejected moderation outcomes do not burn a credit."
  },
  {
    question: "Can younger players use the platform?",
    answer:
      "The MVP is restricted to 18+ users until a guardian-managed workflow is implemented and legally reviewed."
  },
  {
    question: "What kinds of ads fit the product?",
    answer:
      "The best launch ads are sponsor placements relevant to players: training, recovery, travel, events, media services, and trusted football partners."
  }
] as const;
