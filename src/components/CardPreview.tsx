import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Send,
  Copy as CopyIcon
} from "lucide-react";
import {
  buildCardShareText,
  Card as ShareCard,
} from "../utils/shareText";

/* ---------------- external data shape you pass in ---------------- */

export type CardData = {
  title?: string;
  theme?: "luxe" | "minimal" | "tech";
  type?: "business" | "personal";

  name?: string;
  role?: string;

  phone?: string;
  email?: string;
  website?: string;

  address?: string;        // readable address
  addressMap?: string;     // explicit Google Maps url (optional)

  logoUrl?: string;

  socials?: Partial<{
    linkedin: string;
    twitter: string;
    instagram: string;
    facebook: string;
    youtube: string;
    whatsapp: string;   // number or wa.me link
    telegram: string;   // @user or url
  }>;

  /** Optional structured extras you already keep */
  extra?: {
    personal?: { photoUrl?: string };
    company?: {
      companyName?: string;
      companyLogo?: string;
      category?: string;   // Business Category shown on the card
      phone?: string;
      email?: string;
      address?: string;
      website?: string;
    };
  };
};

type Props = {
  id?: string;
  data: CardData;
  theme?: "luxe" | "minimal" | "tech";
  showPlaceholders?: boolean;
};

/* ---------------- helpers ---------------- */

function ensureHttp(u?: string) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
}

function compactHost(u?: string) {
  if (!u) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`);
    return url.host.replace(/^www\./, "");
  } catch {
    return u.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  }
}

function hrefForMaps(address?: string, direct?: string) {
  if (direct) return direct;
  if (!address) return "";
  return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
}

function normalizeDigits(v?: string) {
  return v ? v.replace(/[^\d]/g, "") : "";
}

function socialHref(kind: string, raw?: string) {
  if (!raw) return "";
  const v = raw.trim();

  switch (kind) {
    case "linkedin":
      return /^https?:\/\//i.test(v) ? v : `https://www.linkedin.com/in/${v.replace(/^@/, "")}`;
    case "twitter":
      return /^https?:\/\//i.test(v) ? v : `https://x.com/${v.replace(/^@/, "")}`;
    case "instagram":
      return /^https?:\/\//i.test(v) ? v : `https://instagram.com/${v.replace(/^@/, "")}`;
    case "facebook":
      return /^https?:\/\//i.test(v) ? v : `https://facebook.com/${v.replace(/^@/, "")}`;
    case "youtube":
      return /^https?:\/\//i.test(v) ? v : `https://youtube.com/${v}`;
    case "telegram":
      return v.startsWith("@") ? `https://t.me/${v.slice(1)}` : ensureHttp(v);
    case "whatsapp":
      if (/^https?:\/\//i.test(v)) return v;
      return `https://wa.me/${normalizeDigits(v)}`;
    default:
      return ensureHttp(v);
  }
}

function Row({
  icon,
  children,
  href,
  aria,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  href?: string;
  aria?: string;
}) {
  const Icon = icon;
  const content = (
    <div className="flex items-center gap-2 text-[15px] leading-6">
      <Icon size={16} className="opacity-80 shrink-0" />
      <span className="truncate">{children}</span>
    </div>
  );

  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={aria}
      className="block hover:text-[var(--gold)]"
    >
      {content}
    </a>
  ) : (
    <div>{content}</div>
  );
}

/** Map your CardData → shareText.ts Card format */
function toShareCard(data: CardData): ShareCard {
  return {
    // Personal
    name: data.name,
    designation: data.role,
    phone: data.phone,
    email: data.email,
    website: data.website,
    location: data.address,
    mapsQuery: data.addressMap,
    gender: data.extra?.personal as any ? (data.extra?.personal as any).gender : undefined, // optional

    // Business
    companyName: data.extra?.company?.companyName,
    businessCategory: data.extra?.company?.category,
    companyPhone: data.extra?.company?.phone,
    companyEmail: data.extra?.company?.email,
    companyAddress: data.extra?.company?.address,
    companyWebsite: data.extra?.company?.website,

    // Social
    social: {
      linkedin: data.socials?.linkedin,
      twitter: data.socials?.twitter,
      instagram: data.socials?.instagram,
      facebook: data.socials?.facebook,
      youtube: data.socials?.youtube,
      telegram: data.socials?.telegram,
    },
  };
}


/* ---------------- component ---------------- */

export default function CardPreview({
  id,
  data,
  theme = "luxe",
  showPlaceholders = true,
}: Props) {
  const {
    name,
    role,
    phone,
    email,
    website,
    address,
    addressMap,
    logoUrl,
    socials = {},
    extra,
    type,
  } = data || {};

  // avatar/logo chain
  const logo =
    extra?.personal?.photoUrl ||
    extra?.company?.companyLogo ||
    logoUrl ||
    "";

  // business category chip text
  const category =
    extra?.company?.category?.trim() ||
    (type === "business" ? "Business" : "");

  const mapHref = hrefForMaps(address, addressMap);

  // theme surface (kept close to your palette)
  const surface =
    theme === "minimal"
      ? "bg-white text-black"
      : theme === "tech"
        ? "bg-[#0F1623] text-white"
        : "bg-[var(--surface)] text-[var(--text)]"; // luxe (default)

  // which socials are filled
  // socials icons map (swap WhatsApp icon to FaWhatsapp)
  const socialDefs: Array<{
    key: "linkedin" | "twitter" | "instagram" | "facebook" | "youtube" | "whatsapp" | "telegram";
    Icon: React.ElementType;
    label: string;
  }> = [
      { key: "linkedin", Icon: Linkedin, label: "LinkedIn" },
      { key: "twitter", Icon: Twitter, label: "Twitter/X" },
      { key: "instagram", Icon: Instagram, label: "Instagram" },
      { key: "facebook", Icon: Facebook, label: "Facebook" },
      { key: "youtube", Icon: Youtube, label: "YouTube" },
      { key: "whatsapp", Icon: FaWhatsapp, label: "WhatsApp" }, // ✅ official logo
      { key: "telegram", Icon: Send, label: "Telegram" },
    ];


  const availableSocials = socialDefs.filter((s) => {
    const v = (socials as any)?.[s.key];
    return typeof v === "string" && v.trim().length > 0;
  });

  /* --------- Copy + WhatsApp actions --------- */

  const shareMessage = React.useMemo(
    () => buildCardShareText(toShareCard(data)),
    [data]
  );

  // inside CardPreview component, above handlers
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = shareMessage;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    } finally {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500); // auto-hide
    }
  };



  /** If you want to target a specific number, pass it (E.164) */
  const openWhatsApp = (phoneE164?: string) => {
    const base = phoneE164
      ? `https://wa.me/${normalizeDigits(phoneE164)}`
      : "https://wa.me/";
    const url = `${base}?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, "_blank");
  };

  return (
    <div
      id={id}
      className={`w-full max-w-[520px] ${surface} rounded-2xl`}
    >
      {/* inner panel – comfy spacing + overflow guard to avoid overlap */}
      <div className="rounded-2xl p-5 md:p-6 border border-[var(--border)] bg-[var(--muted)]/40 overflow-hidden">
        {/* Header: avatar + name/role + category at top-right */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-12 w-12 rounded-xl overflow-hidden bg-[var(--muted)] grid place-items-center shrink-0">
              {logo ? (
                <img src={logo} alt="logo" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs opacity-70">LOGO</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[18px] font-semibold leading-tight truncate">
                {name || (showPlaceholders ? "Your Name" : "")}
              </div>
              {role && (
                <div className="text-sm text-[var(--subtle)] truncate">{role}</div>
              )}
            </div>
          </div>
          {category && (
            <span
              className="whitespace-nowrap ml-4 inline-flex items-center rounded-full
                         border border-[var(--border)] bg-[var(--muted)]/55
                         px-3 py-[6px] text-xs font-medium text-[var(--subtle)]"
              title="Business Category"
            >
              {category}
            </span>
          )}
        </div>

        {/* Contact grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          <div className="space-y-2">
            {phone && (
              <Row icon={Phone} href={`tel:${phone}`} aria="Call">
                {phone}
              </Row>
            )}
            {email && (
              <Row icon={Mail} href={`mailto:${email}`} aria="Email">
                {email}
              </Row>
            )}
          </div>

          <div className="space-y-2">
            {website && (
              <Row icon={Globe} href={ensureHttp(website)} aria="Website">
                {compactHost(website)}
              </Row>
            )}
            {address && (
              <Row icon={MapPin} href={mapHref} aria="Open in Maps">
                {address}
              </Row>
            )}
          </div>
        </div>

        {/* Divider + socials */}
        {availableSocials.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[var(--border)]">
            <div className="flex flex-wrap items-center gap-3">
              {availableSocials.map(({ key, Icon, label }) => {
                const link = socialHref(key, (socials as any)[key]);
                if (!link) return null;
                return (
                  <a
                    key={key}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    title={label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full
                               border border-[var(--border)] bg-[var(--muted)]
                               hover:bg-white/10"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions row: Copy + WhatsApp */}
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white px-4 py-2"
            title="Copy generated text"
          >
            <CopyIcon size={16} />
            Copy
          </button>

          {/* If you want to target a specific phone, pass it here, else open picker */}
          <button
            onClick={() => openWhatsApp()} // or openWhatsApp("+919867969445")
            className="inline-flex items-center gap-2 rounded-md bg-green-600 hover:bg-green-700 text-white px-4 py-2"
            title="Share via WhatsApp"
          >
            <FaWhatsapp size={18} color="#25D366" />
            WhatsApp
          </button>
        </div>
      </div>
      {copied && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[9999] rounded-md bg-gray-900 text-white px-3 py-2 shadow-lg border border-gray-700"
        >
          Text copied
        </div>
      )}

    </div>
  );
}
