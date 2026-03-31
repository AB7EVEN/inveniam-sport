export type PersonaSeed = {
  slug: string;
  displayName: string;
  heroHeadline: string;
  heroDescription: string;
  shortBio: string;
  disclosureText: string;
  toneProfile: string;
  visualStyle: string;
  contentCategories: string[];
  boundaries: string[];
  sampleSnippets: string[];
  welcomeMessage: string;
  teaserLabel: string;
  accentColor: string;
  heroGradient: string;
};

export type PlanSeed = {
  slug: string;
  name: string;
  description: string;
  benefits: string[];
  personaSlug?: string;
  monthlyPriceCents: number;
  messageQuota: number;
  isBundle: boolean;
};

export type ContentSeed = {
  slug: string;
  personaSlug: string;
  contentType: "IMAGE" | "VOICE_NOTE" | "GALLERY" | "THEMED_DROP" | "TEXT_POST";
  title: string;
  caption: string;
  assetUrl: string;
  thumbnailUrl: string;
  isPremium: boolean;
  priceCents?: number;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  isTeaser: boolean;
  tags: string[];
  publishedAt: string;
};

export type OfferSeed = {
  slug: string;
  personaSlug: string;
  offerType:
    | "IMAGE_PACK"
    | "VOICE_PACK"
    | "CHAT_CREDITS"
    | "THEMED_DROP"
    | "VIP_UPGRADE";
  title: string;
  description: string;
  priceCents: number;
  contentSlug?: string;
  unitsGranted?: number;
  isActive: boolean;
};

export type FeatureFlagSeed = {
  key: string;
  description: string;
  isEnabled: boolean;
};
