// src/components/CardPreview.tsx
import React, { useMemo } from "react";
import {
  Globe, Mail, Phone, Linkedin, Instagram, Facebook,
  Youtube, Github, Twitter, MessageCircle, MapPin
} from "lucide-react";
import { CardData, CardType, filterCardByType, normalizeType } from "@/lib/cardTypes";

type Props = {
  data?: Partial<CardData>;
  type?: CardType;
  theme?: "luxe" | "minimal" | "tech" | string; 
  showPlaceholders?: boolean;
  id?: string;
};

const iconMap: Record<string, React.ReactNode> = {
  phone: <Phone className="h-4 w-4 shrink-0" />,
  email: <Mail className="h-4 w-4 shrink-0" />,
  website: <Globe className="h-4 w-4 shrink-0" />,
  linkedin: <Linkedin className="h-4 w-4 shrink-0" />,
  instagram: <Instagram className="h-4 w-4 shrink-0" />,
  facebook: <Facebook className="h-4 w-4 shrink-0" />,
  youtube: <Youtube className="h-4 w-4 shrink-0" />,
  github: <Github className="h-4 w-4 shrink-0" />,
  twitter: <Twitter className="h-4 w-4 shrink-0" />,
  whatsapp: <MessageCircle className="h-4 w-4 shrink-0" />,
  location: <MapPin className="h-4 w-4 shrink-0" />,
};

const labelMap: Record<string, string> = {
  phone: "Phone",
  email: "Email",
  website: "Website",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  github: "GitHub",
  twitter: "Twitter",
  whatsapp: "WhatsApp",
  location: "Location",
};

const themeStyles = (theme?: string) => {
  switch ((theme || "").toLowerCase()) {
    case "minimal":
      return "bg-white text-black border border-black/10 shadow";
    case "tech":
      return "bg-[#0b1220] text-white border border-white/10 shadow";
    default:
      return "bg-[#12171f] text-white border border-white/10 shadow-xl";
  }
};

const toHref = (key: string, value: string) => {
  if (!value) return "#";
  switch (key) {
    case "phone":
      return `tel:${value}`;
    case "email":
      return `mailto:${value}`;
    case "website":
      return value.startsWith("http") ? value : `https://${value}`;
    case "location": {
      const q = encodeURIComponent(value);
      return `https://maps.google.com/?q=${q}`;
    }
    case "whatsapp":
      return `https://wa.me/${value.replace(/\D/g, "")}`;
    default:
      return value.startsWith("http") ? value : `https://${value}`;
  }
};

export default function CardPreview({
  data,
  type,
  theme,
  showPlaceholders = true,
  id,
}: Props) {
  const t = normalizeType(type);
  const view = useMemo(() => filterCardByType(data, t), [data, t]);
  const name = view.name || (showPlaceholders ? "Your Name" : "");

  // Footer chips content
  const primary: Array<[string, string | undefined]> = [
    ["phone", view.phone],
    ["email", view.email],
    ["website", view.website],
    ["location", (view as any).address || (view as any).location],
  ];

  const socials = view.socials || {};

  return (
    <div className="w-full grid place-items-center">
      <div className="w-[360px] sm:w-[420px]">
        <div id={id} className={`rounded-2xl p-5 relative ${themeStyles(theme)}`} style={{ boxShadow: "0 10px 30px rgba(0,0,0,.35)" }}>
          {/* HEADER */}
          <div className="flex items-start gap-4 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-white/10 grid place-items-center overflow-hidden">
              {view.logoUrl ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <img src={view.logoUrl} crossOrigin="anonymous" className="h-full w-full object-cover" />
              ) : (
                <span className={`text-xs font-semibold ${theme === "minimal" ? "text-black/70" : "text-white/80"}`}>LOGO</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-[1.1rem] font-semibold leading-6 truncate">
                {name}
              </div>
              {view.role && (
                <div className={`${theme === "minimal" ? "text-black/70" : "text-white/70"} text-sm leading-5 truncate`}>
                  {view.role}
                </div>
              )}
              {view.tagline && (
                <div className={`${theme === "minimal" ? "text-black/60" : "text-white/60"} text-xs leading-5 line-clamp-2`}>
                  {view.tagline}
                </div>
              )}
            </div>
          </div>

          {/* FOOTER CHIPS */}
          <div className="mt-4">
            {/* Primary */}
            <div className="flex flex-wrap gap-2">
              {primary.map(([key, value]) =>
                value ? (
                  <a
                    key={key}
                    href={toHref(key, String(value))}
                    target="_blank"
                    rel="noreferrer"
                    title={String(value)}
                    className={`max-w-full inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
                      theme === "minimal"
                        ? "bg-black/5 hover:bg-black/10 border border-black/10 text-black"
                        : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                    }`}
                  >
                    {iconMap[key]}
                    <span className="text-xs truncate">{labelMap[key]}</span>
                  </a>
                ) : null
              )}
            </div>

            {/* Socials */}
            {socials && Object.keys(socials).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(socials).map(([k, v]) =>
                  v ? (
                    <a
                      key={k}
                      href={toHref(k, String(v))}
                      target="_blank"
                      rel="noreferrer"
                      title={String(v)}
                      className={`max-w-full inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
                        theme === "minimal"
                          ? "bg-black/5 hover:bg-black/10 border border-black/10 text-black"
                          : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                      }`}
                    >
                      {(iconMap as any)[k] ?? <Globe className="h-4 w-4" />}
                      <span className="text-xs truncate">{labelMap[k] ?? k}</span>
                    </a>
                  ) : null
                )}
              </div>
            )}
          </div>

          {/* Type tag (bottom-right) */}
          <div className={`absolute right-4 bottom-2 text-[10px] ${theme === "minimal" ? "text-black/50" : "text-white/50"}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        </div>
      </div>
    </div>
  );
}
