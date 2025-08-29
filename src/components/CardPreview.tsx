import React from "react";
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
  Github,
  MessageSquare,
} from "lucide-react";
import { CardData, CardType } from "@/lib/cardTypes";

type Props = {
  id?: string;
  data: Partial<CardData>;
  type?: CardType;
  theme?: string;
  showPlaceholders?: boolean;
  /** NEW: shrinks width so it never overflows cards on grid */
  compact?: boolean;
};

const icon = {
  phone: <Phone className="h-4 w-4 shrink-0" />,
  email: <Mail className="h-4 w-4 shrink-0" />,
  website: <Globe className="h-4 w-4 shrink-0" />,
  location: <MapPin className="h-4 w-4 shrink-0" />,
  linkedin: <Linkedin className="h-4 w-4 shrink-0" />,
  twitter: <Twitter className="h-4 w-4 shrink-0" />,
  instagram: <Instagram className="h-4 w-4 shrink-0" />,
  facebook: <Facebook className="h-4 w-4 shrink-0" />,
  youtube: <Youtube className="h-4 w-4 shrink-0" />,
  github: <Github className="h-4 w-4 shrink-0" />,
  whatsapp: <MessageSquare className="h-4 w-4 shrink-0" />,
};

const label: Record<string, string> = {
  phone: "Phone",
  email: "Email",
  website: "Website",
  location: "Location",
  linkedin: "LinkedIn",
  twitter: "Twitter",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  github: "GitHub",
  whatsapp: "WhatsApp",
};

function toHref(kind: string, value: string) {
  if (!value) return "#";
  switch (kind) {
    case "phone":
      return value.startsWith("tel:") ? value : `tel:${value}`;
    case "email":
      return value.startsWith("mailto:") ? value : `mailto:${value}`;
    case "website":
      return value.startsWith("http") ? value : `https://${value}`;
    case "location":
      if (/^https?:\/\/(maps\.google|goo\.gl)\//i.test(value)) return value;
      return `https://maps.google.com/?q=${encodeURIComponent(value)}`;
    case "linkedin":
      return value.startsWith("http")
        ? value
        : `https://www.linkedin.com/${value.replace(/^@/, "")}`;
    case "twitter":
      return value.startsWith("http")
        ? value
        : `https://x.com/${value.replace(/^@/, "")}`;
    case "instagram":
      return value.startsWith("http")
        ? value
        : `https://instagram.com/${value.replace(/^@/, "")}`;
    case "facebook":
      return value.startsWith("http")
        ? value
        : `https://facebook.com/${value.replace(/^@/, "")}`;
    case "youtube":
      return value.startsWith("http") ? value : `https://youtube.com/${value}`;
    case "github":
      return value.startsWith("http")
        ? value
        : `https://github.com/${value.replace(/^@/, "")}`;
    case "whatsapp":
      if (value.startsWith("http")) return value;
      const digits = value.replace(/[^\d]/g, "");
      return `https://wa.me/${digits}`;
    default:
      return value;
  }
}

export default function CardPreview({
  id,
  data,
  type,
  showPlaceholders,
  compact,
}: Props) {
  const view = data || {};
  const name = view.name || (showPlaceholders ? "Your Name" : "");
  const role = view.role || (showPlaceholders ? "Your Role" : "");
  const logo = view.logoUrl;
  const corner =
    (view.type || type || "Business")[0].toUpperCase() +
    (view.type || type || "Business").slice(1);

  const primary: Array<[string, string | undefined]> = [
    ["phone", view.phone],
    ["email", view.email],
    ["website", view.website],
    ["location", view.addressMap || view.address],
  ];
  const socials = view.socials || {};

  const chips = (items: Array<[string, string | undefined]>) =>
    items
      .filter(([, v]) => !!v)
      .map(([k, v]) => {
        const href = toHref(k, v as string);
        return (
          <a
            key={k}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 border border-[var(--border)] bg-[var(--muted)]/40 hover:bg-white/5 transition text-sm"
          >
            {icon[k as keyof typeof icon]}
            <span className="truncate">{label[k]}</span>
          </a>
        );
      });

  // width: full for tiles; slightly wider on full preview
  const widthClass = compact
    ? "w-full max-w-[300px]" // ✅ fits in grid tiles
    : "w-[360px] max-w-full";

  return (
    <div
      id={id}
      className={`${widthClass} rounded-2xl bg-[var(--surface)] text-[var(--text)] p-5 shadow-xl relative`}
    >
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-xl bg-[var(--muted)] grid place-items-center overflow-hidden border border-[var(--border)]">
          {logo ? (
            <img
              src={logo}
              crossOrigin="anonymous"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs opacity-70">LOGO</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-lg font-semibold truncate">{name}</div>
          <div className="text-sm text-[var(--subtle)] truncate">{role}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">{chips(primary)}</div>

      <div className="mt-2 flex flex-wrap gap-2">
        {chips([
          ["linkedin", socials.linkedin],
          ["github", socials.github],
          ["twitter", socials.twitter],
          ["facebook", socials.facebook],
          ["youtube", socials.youtube],
          ["instagram", socials.instagram],
          ["whatsapp", socials.whatsapp],
        ])}
      </div>

      <div className="absolute bottom-3 right-4 text-xs text-[var(--subtle)]">
        {corner}
      </div>
    </div>
  );
}
