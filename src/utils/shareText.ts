// src/utils/shareText.ts

export type SocialLinks = {
  linkedin?: string;
  twitter?: string;   // X / Twitter
  instagram?: string;
  facebook?: string;
  youtube?: string;   // can be @handle or url
  telegram?: string;  // @user or url
};

export type Card = {
  // Personal
  name?: string;
  designation?: string;
  phone?: string;
  email?: string;
  website?: string;
  location?: string;
  /** Optional: if you store gender, accept it but DO NOT display it */
  gender?: string;

  // Prefer a direct maps URL if you have it; otherwise we'll build from location
  mapsQuery?: string;

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

const WEBSITE = "https://instantllycards.com";

/* ---------- helpers ---------- */

function ensureHttp(u?: string) {
  if (!u) return "";
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

function googleMapsLinkFrom(location?: string, direct?: string) {
  // If a direct URL is supplied (e.g., https://maps.app.goo.gl/..), use it AS-IS
  if (direct) {
    if (/^https?:\/\//i.test(direct)) return direct;
    return `https://maps.google.com/?q=${encodeURIComponent(direct)}`;
  }
  if (!location) return "";
  return `https://maps.google.com/?q=${encodeURIComponent(location)}`;
}

function fmtLinkedin(v: string) {
  return /^https?:\/\//i.test(v) ? v : `https://www.linkedin.com/in/${v.replace(/^@/, "")}`;
}
function fmtTwitter(v: string) {
  return /^https?:\/\//i.test(v) ? v : `https://x.com/${v.replace(/^@/, "")}`;
}
function fmtInstagram(v: string) {
  return /^https?:\/\//i.test(v) ? v : `https://instagram.com/${v.replace(/^@/, "")}`;
}
function fmtFacebook(v: string) {
  return /^https?:\/\//i.test(v) ? v : `https://facebook.com/${v.replace(/^@/, "")}`;
}
function fmtYouTube(v: string) {
  if (v.startsWith("@")) return `https://youtube.com/${v}`;
  return ensureHttp(v);
}
function fmtTelegram(v: string) {
  return v.startsWith("@") ? `https://t.me/${v.slice(1)}` : ensureHttp(v);
}

/* ---------- builder ---------- */

export function buildCardShareText(card: Card) {
  const lines: string[] = [];

  // Intro (no emojis)
  lines.push("I created my Digital Business Card with Instantly-Cards in under a minute.");
  lines.push("You can make yours too!");
  lines.push(WEBSITE, ""); // blank line

  // Personal
  lines.push("Personal Details -");
  if (card.name) lines.push(`Name - ${card.name}`);
  if (card.designation) lines.push(`Designation - ${card.designation}`);
  if (card.phone) lines.push(`Contact - ${card.phone}`);
  if (card.email) lines.push(`Email Address - ${card.email}`);
  if (card.website) lines.push(`Website - ${ensureHttp(card.website)}`);
  if (card.location) lines.push(`Location - ${card.location}`);
  const maps = googleMapsLinkFrom(card.location, card.mapsQuery);
  if (maps) lines.push(`Google Maps Link - ${maps}`);
  lines.push(""); // spacer

  // Business
  const anyBiz =
    card.companyName ||
    card.businessCategory ||
    card.companyPhone ||
    card.companyEmail ||
    card.companyAddress ||
    card.companyWebsite;

  if (anyBiz) {
    lines.push("Business Profile -");
    if (card.companyName) lines.push(`Company Name - ${card.companyName}`);
    if (card.businessCategory) lines.push(`Business Category - ${card.businessCategory}`);
    if (card.companyPhone) lines.push(`Company Mob No - ${card.companyPhone}`);
    if (card.companyEmail) lines.push(`Company Email id - ${card.companyEmail}`);
    if (card.companyAddress) lines.push(`Company Address - ${card.companyAddress}`);
    if (card.companyWebsite) lines.push(`Website - ${ensureHttp(card.companyWebsite)}`);
    lines.push("");
  }

  // Social
  const s = card.social || {};
  const socials: string[] = [];
  if (s.linkedin) socials.push(`• LinkedIn: ${fmtLinkedin(s.linkedin.trim())}`);
  if (s.twitter) socials.push(`• X/Twitter: ${fmtTwitter(s.twitter.trim())}`);
  if (s.instagram) socials.push(`• Instagram: ${fmtInstagram(s.instagram.trim())}`);
  if (s.facebook) socials.push(`• Facebook: ${fmtFacebook(s.facebook.trim())}`);
  if (s.youtube) socials.push(`• YouTube: ${fmtYouTube(s.youtube.trim())}`);
  if (s.telegram) socials.push(`• Telegram: ${fmtTelegram(s.telegram.trim())}`);

  if (socials.length) {
    lines.push("Social Links -", ...socials);
  }

  return lines.join("\n");
}
