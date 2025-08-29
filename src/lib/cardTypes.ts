// src/lib/cardTypes.ts
export type CardType = "business" | "personal";
export type ThemeName = "luxe" | "minimal" | "tech" | string;

export type Socials = Partial<{
  linkedin: string;
  twitter: string;
  instagram: string;
  facebook: string;
  youtube: string;
  github: string;
  whatsapp: string;   // phone or wa.me url
  telegram: string;   // @username or url
}>;

export type CardData = {
  // Common / existing fields
  title?: string;
  theme?: ThemeName;
  type?: CardType;

  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  address?: string;       // plain address text
  addressMap?: string;    // google maps link if provided
  website?: string;
  logoUrl?: string;
  tagline?: string;

  socials?: Socials;

  // New stuff lives here so backend won’t break
  extra?: {
    personal?: {
      photoUrl?: string;
      gender?: "Male" | "Female" | "Other";
      birthDate?: string;       // ISO
      anniversaryDate?: string; // ISO
      education?: string;
      resAddress?: string;
      pincode?: string;
      mapsLink?: string;
      message?: string;
    };
    company?: {
      companyName?: string;
      companyLogo?: string;
      designation?: string;
      category?: string;
      companyMobile?: string;
      email?: string;
      address?: string;
      mapsLink?: string;
      website?: string;
      message?: string;
    };
  };
};

// default type
export const DEFAULT_CARD_TYPE: CardType = "business";

export function normalizeType(t?: string | null): CardType {
  const k = (t || "").toLowerCase();
  if (k.startsWith("p")) return "personal";
  return "business";
}

/**
 * Keep only fields that belong to the selected type for rendering
 * (won’t mutate original). Also normalizes location preference:
 * - use addressMap if present, else address.
 */
export function filterCardByType(
  src: Partial<CardData> | undefined,
  type: CardType
): CardData {
  const d = { ...(src || {}) };

  const base: CardData = {
    title: d.title,
    theme: d.theme,
    type,
    name: d.name,
    role: d.role,
    email: d.email,
    phone: d.phone,
    address: d.address,
    addressMap: d.addressMap,
    website: d.website,
    logoUrl: d.logoUrl,
    tagline: d.tagline,
    socials: { ...(d.socials || {}) },
    extra: d.extra || {},
  };

  // prefer maps links if provided (top level or extras)
  const map1 = d.addressMap;
  const map2 =
    type === "personal"
      ? d.extra?.personal?.mapsLink
      : d.extra?.company?.mapsLink;

  base.addressMap = map1 || map2 || undefined;

  // Select additional fields sources for convenience
  if (type === "personal") {
    // If personal has a photo, prefer that as logo when no logoUrl
    if (!base.logoUrl && d.extra?.personal?.photoUrl) {
      base.logoUrl = d.extra.personal.photoUrl;
    }
  } else {
    // business/company: prefer company name/website if present
    if (!base.name && d.extra?.company?.companyName) {
      base.name = d.extra.company.companyName;
    }
    if (!base.website && d.extra?.company?.website) {
      base.website = d.extra.company.website;
    }
    if (!base.logoUrl && d.extra?.company?.companyLogo) {
      base.logoUrl = d.extra.company.companyLogo;
    }
    if (!base.role && d.extra?.company?.designation) {
      base.role = d.extra.company.designation;
    }
    if (!base.phone && d.extra?.company?.companyMobile) {
      base.phone = d.extra.company.companyMobile;
    }
    if (!base.email && d.extra?.company?.email) {
      base.email = d.extra.company.email;
    }
    if (!base.address && d.extra?.company?.address) {
      base.address = d.extra.company.address;
    }
  }

  // Clean socials to known keys only
  const s = base.socials || {};
  base.socials = {
    linkedin: s.linkedin,
    twitter: s.twitter,
    instagram: s.instagram,
    facebook: s.facebook,
    youtube: s.youtube,
    github: s.github,
    whatsapp: s.whatsapp,
    telegram: s.telegram,
  };

  return base;
}

/**
 * Basic validation per card type. Returns missing labels for UI.
 */
export function validateCard(d: Partial<CardData>, type: CardType) {
  const missing: string[] = [];
  if (!d.name && !(type === "business" && d.extra?.company?.companyName)) {
    missing.push("Name");
  }
  // Need at least one contact surface
  if (!d.phone && !d.email && !d.website && !d.socials?.whatsapp) {
    missing.push("At least one contact (Phone / Email / Website / WhatsApp)");
  }
  return { ok: missing.length === 0, missing };
}
