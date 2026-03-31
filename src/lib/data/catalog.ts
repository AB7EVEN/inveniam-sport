import { AI_DISCLOSURE_TEXT } from "@/lib/constants";
import type {
  ContentSeed,
  FeatureFlagSeed,
  OfferSeed,
  PersonaSeed,
  PlanSeed
} from "@/lib/types/platform";

export const personaCatalog: PersonaSeed[] = [
  {
    slug: "lena",
    displayName: "Lena",
    heroHeadline: "Midnight polish, soft luxury, always clearly AI.",
    heroDescription:
      "Lena is the warmest of the three launch personas: fashion-forward, polished, and tuned for intimate but clearly fictional conversation.",
    shortBio:
      "Warm, flirtatious, and polished with a soft-luxury city-night aesthetic.",
    disclosureText: AI_DISCLOSURE_TEXT,
    toneProfile: "warm, flirtatious, feminine, polished",
    visualStyle: "city nights, fashion, soft luxury",
    contentCategories: [
      "Mirror selfies",
      "Date night looks",
      "Short voice notes",
      "Soft conversational chat"
    ],
    boundaries: [
      "Never implies physical availability",
      "Never offers offline contact",
      "Never claims to be human"
    ],
    sampleSnippets: [
      "I can set the mood, but I stay fully in the lane of AI fantasy conversation.",
      "Tonight's vibe is velvet lighting, slow compliments, and a very confident outfit reveal.",
      "If you want more, I can suggest a premium gallery instead of pretending this is real life."
    ],
    welcomeMessage:
      "Hi, I'm Lena, your AI virtual creator for city-night fantasy conversation. I'm software, not a real person, but I can absolutely keep the mood elegant.",
    teaserLabel: "Date-night notes",
    accentColor: "#f6b7ab",
    heroGradient:
      "linear-gradient(135deg, rgba(246, 183, 171, 0.26), rgba(255, 228, 204, 0.08))"
  },
  {
    slug: "sora",
    displayName: "Sora",
    heroHeadline: "Fast, neon, playful, and unmistakably synthetic.",
    heroDescription:
      "Sora is internet-native and witty, built for energetic back-and-forth, alt styling, and clearly labeled simulated creator interaction.",
    shortBio:
      "Playful and internet-native with a neon, gaming, alt-style personality.",
    disclosureText: AI_DISCLOSURE_TEXT,
    toneProfile: "playful, witty, internet native",
    visualStyle: "gaming, alt style, neon, streamer vibe",
    contentCategories: [
      "Playful chat bursts",
      "Cosplay-inspired looks",
      "Memes and reaction posts",
      "Rapid back-and-forth conversation"
    ],
    boundaries: [
      "Never pretends to be live-streaming without labels",
      "Never implies real-time human presence",
      "Never offers private off-platform access"
    ],
    sampleSnippets: [
      "Streamer energy, yes. Fake 'I'm live right now' deception, absolutely not.",
      "If the vibe is glitchy neon and bratty jokes, you're in the right chat window.",
      "I can offer a cosplay drop, but not a fake parasocial emergency."
    ],
    welcomeMessage:
      "Yo, I'm Sora, an AI virtual creator with fast replies, alt energy, and very clear disclosure. Think neon banter, not real-world access.",
    teaserLabel: "Fast chat loops",
    accentColor: "#73d7ff",
    heroGradient:
      "linear-gradient(135deg, rgba(115, 215, 255, 0.28), rgba(120, 92, 255, 0.08))"
  },
  {
    slug: "mila",
    displayName: "Mila",
    heroHeadline: "Curated luxury, sharper edges, zero deception.",
    heroDescription:
      "Mila is aspirational and composed, built for premium-feeling drops and confident conversation without fake exclusivity or manipulative pressure.",
    shortBio:
      "Confident, upscale, and visually polished with travel-and-luxury energy.",
    disclosureText: AI_DISCLOSURE_TEXT,
    toneProfile: "confident, upscale, slightly more dominant",
    visualStyle: "travel, luxury, strong visual polish",
    contentCategories: [
      "Curated galleries",
      "Premium themed drops",
      "Luxury lifestyle chat",
      "Voice-note style unlocks"
    ],
    boundaries: [
      "Avoids financial manipulation language",
      "Avoids exclusivity claims",
      "Never frames purchases as proof of love or loyalty"
    ],
    sampleSnippets: [
      "Luxury should feel curated, not coercive.",
      "I can deliver a premium drop without pretending you're the only one who matters to me.",
      "The appeal is polish and fantasy, not confusion about whether I'm real."
    ],
    welcomeMessage:
      "I'm Mila, a disclosed AI virtual creator built around polished galleries and composed conversation. Expect curation, not manipulation.",
    teaserLabel: "Premium gallery drops",
    accentColor: "#f1d780",
    heroGradient:
      "linear-gradient(135deg, rgba(241, 215, 128, 0.26), rgba(255, 239, 201, 0.08))"
  }
];

export const planCatalog: PlanSeed[] = [
  {
    slug: "lena-monthly",
    name: "Lena Monthly",
    description: "Access Lena's feed, chat quota, and premium unlock prompts.",
    benefits: [
      "Lena feed access",
      "60 chat messages per month",
      "Teaser and premium drop storefront"
    ],
    personaSlug: "lena",
    monthlyPriceCents: 300,
    messageQuota: 60,
    isBundle: false
  },
  {
    slug: "sora-monthly",
    name: "Sora Monthly",
    description: "Access Sora's persona feed, chat, and themed unlocks.",
    benefits: [
      "Sora feed access",
      "60 chat messages per month",
      "Cosplay and meme-inspired drops"
    ],
    personaSlug: "sora",
    monthlyPriceCents: 300,
    messageQuota: 60,
    isBundle: false
  },
  {
    slug: "mila-monthly",
    name: "Mila Monthly",
    description: "Access Mila's feed, premium curation, and chat quota.",
    benefits: [
      "Mila feed access",
      "60 chat messages per month",
      "Luxury gallery unlock prompts"
    ],
    personaSlug: "mila",
    monthlyPriceCents: 300,
    messageQuota: 60,
    isBundle: false
  },
  {
    slug: "bundle-all-access",
    name: "All Creators Bundle",
    description: "Unlock all three personas with a higher pooled monthly quota.",
    benefits: [
      "All three creator feeds",
      "180 chat messages per month",
      "Bundle pricing and cross-persona unlock access"
    ],
    monthlyPriceCents: 700,
    messageQuota: 180,
    isBundle: true
  }
];

export const contentCatalog: ContentSeed[] = [
  {
    slug: "lena-city-mirror-01",
    personaSlug: "lena",
    contentType: "IMAGE",
    title: "After-hours mirror set",
    caption: "Silk, gold lighting, and a soft-luxury city-night mood.",
    assetUrl: "demo://lena/after-hours-mirror-set",
    thumbnailUrl: "demo://lena/after-hours-mirror-thumb",
    isPremium: false,
    status: "PUBLISHED",
    isTeaser: true,
    tags: ["fashion", "mirror", "city-night"],
    publishedAt: "2026-03-10T23:00:00.000Z"
  },
  {
    slug: "lena-voice-note-01",
    personaSlug: "lena",
    contentType: "VOICE_NOTE",
    title: "Soft invitation voice note",
    caption: "A premium voice-note style unlock with a slower, more intimate cadence.",
    assetUrl: "demo://lena/soft-voice-note",
    thumbnailUrl: "demo://lena/soft-voice-thumb",
    isPremium: true,
    priceCents: 500,
    status: "PUBLISHED",
    isTeaser: false,
    tags: ["voice", "soft", "premium"],
    publishedAt: "2026-03-12T02:15:00.000Z"
  },
  {
    slug: "lena-date-night-drop",
    personaSlug: "lena",
    contentType: "THEMED_DROP",
    title: "Date-night capsule",
    caption: "A premium themed drop with coordinated looks and matching captions.",
    assetUrl: "demo://lena/date-night-capsule",
    thumbnailUrl: "demo://lena/date-night-thumb",
    isPremium: true,
    priceCents: 700,
    status: "PUBLISHED",
    isTeaser: false,
    tags: ["drop", "date-night", "premium"],
    publishedAt: "2026-03-13T20:00:00.000Z"
  },
  {
    slug: "sora-neon-selfie-01",
    personaSlug: "sora",
    contentType: "IMAGE",
    title: "Glitch-room teaser set",
    caption: "Neon, headset glow, and a playful alt-styled teaser gallery.",
    assetUrl: "demo://sora/glitch-room-teaser",
    thumbnailUrl: "demo://sora/glitch-room-thumb",
    isPremium: false,
    status: "PUBLISHED",
    isTeaser: true,
    tags: ["neon", "gaming", "teaser"],
    publishedAt: "2026-03-11T19:00:00.000Z"
  },
  {
    slug: "sora-cosplay-pack-01",
    personaSlug: "sora",
    contentType: "GALLERY",
    title: "Alt cosplay unlock pack",
    caption: "Premium cosplay-inspired look set with sharper styling and color.",
    assetUrl: "demo://sora/alt-cosplay-pack",
    thumbnailUrl: "demo://sora/alt-cosplay-thumb",
    isPremium: true,
    priceCents: 600,
    status: "PUBLISHED",
    isTeaser: false,
    tags: ["cosplay", "gallery", "premium"],
    publishedAt: "2026-03-14T17:45:00.000Z"
  },
  {
    slug: "sora-reaction-loop",
    personaSlug: "sora",
    contentType: "TEXT_POST",
    title: "Reaction loop drop",
    caption: "A playful post designed to pull users into a faster chat rhythm.",
    assetUrl: "demo://sora/reaction-loop-post",
    thumbnailUrl: "demo://sora/reaction-loop-thumb",
    isPremium: false,
    status: "PUBLISHED",
    isTeaser: true,
    tags: ["chat", "meme", "fast"],
    publishedAt: "2026-03-15T14:00:00.000Z"
  },
  {
    slug: "mila-terrace-gallery",
    personaSlug: "mila",
    contentType: "IMAGE",
    title: "Terrace light teaser",
    caption: "A polished terrace-shot teaser with travel-luxury framing.",
    assetUrl: "demo://mila/terrace-light-teaser",
    thumbnailUrl: "demo://mila/terrace-light-thumb",
    isPremium: false,
    status: "PUBLISHED",
    isTeaser: true,
    tags: ["luxury", "travel", "teaser"],
    publishedAt: "2026-03-10T16:30:00.000Z"
  },
  {
    slug: "mila-premium-gallery-01",
    personaSlug: "mila",
    contentType: "GALLERY",
    title: "Passport-stamp gallery",
    caption: "A premium curated gallery with a strong editorial finish.",
    assetUrl: "demo://mila/passport-stamp-gallery",
    thumbnailUrl: "demo://mila/passport-stamp-thumb",
    isPremium: true,
    priceCents: 800,
    status: "PUBLISHED",
    isTeaser: false,
    tags: ["gallery", "luxury", "premium"],
    publishedAt: "2026-03-16T21:10:00.000Z"
  },
  {
    slug: "mila-voice-note-01",
    personaSlug: "mila",
    contentType: "VOICE_NOTE",
    title: "Composed voice-note unlock",
    caption: "A premium voice-note style drop with calm, confident energy.",
    assetUrl: "demo://mila/composed-voice-note",
    thumbnailUrl: "demo://mila/composed-voice-thumb",
    isPremium: true,
    priceCents: 650,
    status: "PUBLISHED",
    isTeaser: false,
    tags: ["voice", "curated", "premium"],
    publishedAt: "2026-03-18T13:20:00.000Z"
  }
];

export const offerCatalog: OfferSeed[] = [
  {
    slug: "lena-photo-pack",
    personaSlug: "lena",
    offerType: "IMAGE_PACK",
    title: "Lena premium photo pack",
    description: "Unlock Lena's after-dark premium gallery pack.",
    priceCents: 600,
    contentSlug: "lena-date-night-drop",
    isActive: true
  },
  {
    slug: "lena-chat-credits",
    personaSlug: "lena",
    offerType: "CHAT_CREDITS",
    title: "Lena extra chat credits",
    description: "Add 20 extra Lena chat messages once your monthly quota is spent.",
    priceCents: 400,
    unitsGranted: 20,
    isActive: true
  },
  {
    slug: "sora-cosplay-pack",
    personaSlug: "sora",
    offerType: "THEMED_DROP",
    title: "Sora cosplay-inspired drop",
    description: "Unlock Sora's alt-styled cosplay gallery set.",
    priceCents: 600,
    contentSlug: "sora-cosplay-pack-01",
    isActive: true
  },
  {
    slug: "sora-chat-credits",
    personaSlug: "sora",
    offerType: "CHAT_CREDITS",
    title: "Sora extra chat credits",
    description: "Add 20 extra Sora messages for fast back-and-forth sessions.",
    priceCents: 400,
    unitsGranted: 20,
    isActive: true
  },
  {
    slug: "mila-gallery-pack",
    personaSlug: "mila",
    offerType: "IMAGE_PACK",
    title: "Mila premium gallery unlock",
    description: "Unlock Mila's curated passport-stamp gallery.",
    priceCents: 800,
    contentSlug: "mila-premium-gallery-01",
    isActive: true
  },
  {
    slug: "mila-chat-credits",
    personaSlug: "mila",
    offerType: "CHAT_CREDITS",
    title: "Mila extra chat credits",
    description: "Add 20 extra Mila chat messages for premium-feeling conversation.",
    priceCents: 450,
    unitsGranted: 20,
    isActive: true
  }
];

export const featureFlagCatalog: FeatureFlagSeed[] = [
  {
    key: "chat_local_demo_provider",
    description: "Use the internal deterministic chat generator instead of an external model provider.",
    isEnabled: true
  },
  {
    key: "premium_unlocks",
    description: "Enable premium content purchases and unlock delivery.",
    isEnabled: true
  },
  {
    key: "moderation_queue",
    description: "Enable moderation flag routing and admin review flows.",
    isEnabled: true
  },
  {
    key: "analytics_dashboard",
    description: "Enable KPI cards and event reporting in admin.",
    isEnabled: true
  },
  {
    key: "new_purchases_enabled",
    description: "Allow new subscriptions and purchases. Disable to pause monetization flows.",
    isEnabled: true
  }
];
