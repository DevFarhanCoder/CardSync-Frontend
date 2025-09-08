// src/utils/shareText.ts
export type SocialLinks = {
  linkedin?: string;
  twitter?: string;   // or "x"
  instagram?: string;
  facebook?: string;
  youtube?: string;
  telegram?: string;
};

export type Card = {
  // Personal
  name?: string;
  designation?: string;
  phone?: string;          // e.g., +91 98679 69445
  email?: string;
  website?: string;        // personal site
  location?: string;       // "Jogeshwari, Mumbai"
  mapsQuery?: string;      // optional explicit query; else built from location

  // Business
  companyName?: string;
  businessCategory?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyAddress?: string;
  companyWebsite?: string;

  // Social
  social?: SocialLinks;
};

const WEBSITE = "https://instantllycards.com"; // your landing page

function googleMapsLinkFrom(text?: string) {
  if (!text) return "";
  const q = encodeURIComponent(text.trim());
  return `https://maps.google.com/?q=${q}`;
}

export function buildCardShareText(card: Card) {
  const lines: string[] = [];

  lines.push("👋🏻I created my Digital Business Card with Instantly-Cards in under a minute.");
  lines.push("You can make yours too!😍");
  lines.push(WEBSITE, ""); // blank line

  // Personal
  lines.push("Personal Details -");
  if (card.name) lines.push(`Name - ${card.name}`);
  if (card.designation) lines.push(`Designation - ${card.designation}`);
  if (card.phone) lines.push(`Contact - ${card.phone}`);
  if (card.email) lines.push(`Email Address - ${card.email}`);
  if (card.website) lines.push(`Website - ${card.website}`);
  if (card.location) lines.push(`Location - ${card.location}`);
  const maps = card.mapsQuery ? googleMapsLinkFrom(card.mapsQuery) : googleMapsLinkFrom(card.location);
  if (maps) lines.push(`Google Maps Link - ${maps}`, "");

  // Business
  const anyBiz =
    card.companyName || card.businessCategory || card.companyPhone || card.companyEmail || card.companyAddress || card.companyWebsite;
  if (anyBiz) {
    lines.push("Business Profile -");
    if (card.companyName) lines.push(`Company Name - ${card.companyName}`);
    if (card.businessCategory) lines.push(`Business Category - ${card.businessCategory}`);
    if (card.companyPhone) lines.push(`Company Mob No - ${card.companyPhone}`);
    if (card.companyEmail) lines.push(`Company Email id - ${card.companyEmail}`);
    if (card.companyAddress) lines.push(`Company Address - ${card.companyAddress}`);
    if (card.companyWebsite) lines.push(`Website - ${card.companyWebsite}`);
    lines.push("");
  }

  // Social
  const s = card.social || {};
  const socials: string[] = [];
  if (s.linkedin) socials.push(`• LinkedIn: ${s.linkedin}`);
  if (s.twitter) socials.push(`• X/Twitter: ${s.twitter}`);
  if (s.instagram) socials.push(`• Instagram: ${s.instagram}`);
  if (s.facebook) socials.push(`• Facebook: ${s.facebook}`);
  if (s.youtube) socials.push(`• YouTube: ${s.youtube}`);
  if (s.telegram) socials.push(`• Telegram: ${s.telegram}`);
  if (socials.length) {
    lines.push("Social Links -", ...socials);
  }

  return lines.join("\n");
}
