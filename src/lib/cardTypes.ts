// src/lib/cardTypes.ts
export type CardType = "business" | "personal" | "portfolio" | "event";

export type SocialLinks = Partial<{
  phone: string;
  email: string;
  website: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  youtube: string;
  github: string;
  twitter: string;
  whatsapp: string; // number with or without +country
}>;

export type CardData = {
  name: string;
  role?: string;
  tagline?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  logoUrl?: string;
  socials?: SocialLinks;
};

type TypeConfig = {
  required: (keyof CardData)[];
  optional: (keyof CardData)[];
  allowedSocials: (keyof SocialLinks)[];
};

export const DEFAULT_CARD_TYPE: CardType = "business";

const ORDERED_TYPES: readonly CardType[] = [
  "business",
  "personal",
  "portfolio",
  "event",
] as const;

export function normalizeType(t?: CardType | string): CardType {
  return (ORDERED_TYPES as readonly string[]).includes(String(t))
    ? (t as CardType)
    : DEFAULT_CARD_TYPE;
}

export const TYPE_FIELDS: Record<CardType, TypeConfig> = {
  business: {
    required: ["name", "email", "phone", "address"],
    optional: ["role", "website", "logoUrl", "tagline"],
    allowedSocials: ["phone", "email", "website", "linkedin", "github", "twitter", "facebook", "youtube", "whatsapp", "instagram"],
  },
  personal: {
    required: ["name", "email", "phone"],
    optional: ["role", "website", "logoUrl", "tagline", "address"],
    allowedSocials: ["phone", "email", "website", "instagram", "facebook", "youtube", "whatsapp"],
  },
  portfolio: {
    required: ["name", "email", "website"],
    optional: ["role", "logoUrl", "tagline", "phone", "address"],
    allowedSocials: ["website", "github", "linkedin", "twitter", "youtube", "email"],
  },
  event: {
    required: ["name", "address"],
    optional: ["website", "logoUrl", "tagline"],
    allowedSocials: ["website", "whatsapp"],
  },
};

/**
 * Safely filters a card to the fields/socials allowed for the given type.
 * Never throws if type or card are incomplete.
 */
export function filterCardByType(card: Partial<CardData> | undefined, type?: CardType): CardData {
  const t = normalizeType(type);
  const cfg = TYPE_FIELDS[t];

  const src: Partial<CardData> = card ?? {};
  const keep = new Set<keyof CardData>([...cfg.required, ...cfg.optional]);

  const filtered: CardData = {
    name: String(src.name ?? ""), // ensure name exists
  };

  for (const key of keep) {
    const value = (src as any)[key];
    if (value !== undefined && value !== "") {
      (filtered as any)[key] = value;
    }
  }

  // socials
  const socialsSrc = src.socials ?? {};
  const s: SocialLinks = {};
  for (const k of cfg.allowedSocials) {
    const v = (socialsSrc as any)[k];
    if (v) (s as any)[k] = v;
  }
  if (Object.keys(s).length) filtered.socials = s;

  return filtered;
}

/**
 * Validates that all required fields (for the type) are present & non-empty.
 * Returns { ok, missing } and never throws.
 */
export function validateCard(card: Partial<CardData> | undefined, type?: CardType) {
  const t = normalizeType(type);
  const cfg = TYPE_FIELDS[t];
  const src: Partial<CardData> = card ?? {};
  const missing = cfg.required.filter((k) => {
    const v = (src as any)[k];
    return v === undefined || String(v).trim() === "";
  });
  return { ok: missing.length === 0, missing, type: t };
}
