// src/components/CardPreview.tsx
import React from "react";
import {
  Globe,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Github,
  MessageCircle,
} from "lucide-react";

/* =========================
 * Types
 * ========================= */
export type CardType = "business" | "personal" | "portfolio" | "event";
export type Theme = "luxe" | "minimal" | "tech";

export type SocialLinks = Partial<{
  website: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  facebook: string;
  youtube: string;
  github: string;
  whatsapp: string; // number or full url
}>;

export type CardData = {
  title: string;
  type: CardType;
  theme: Theme;

  name?: string;
  role?: string;
  tagline?: string;

  email?: string;
  phone?: string;
  address?: string;

  logoUrl?: string;
  website?: string;

  // Event extras
  eventDate?: string;
  eventVenue?: string;

  socials?: SocialLinks;
};

/* =========================
 * Helpers
 * ========================= */
function themeClasses(theme: Theme) {
  switch (theme) {
    case "luxe":
      return {
        card: "bg-[#0f1115] text-[#e9e5dc] border-[#2b2e36]",
        accent: "text-[#d6b356]",
        badge: "bg-[#d6b356] text-black",
        subtle: "text-[#b7b4ad]",
        pill: "bg-white/5 hover:bg-white/10",
      };
    case "minimal":
      return {
        card: "bg-white text-gray-900 border-gray-200",
        accent: "text-gray-900",
        badge: "bg-gray-900 text-white",
        subtle: "text-gray-500",
        pill: "bg-gray-100 hover:bg-gray-200",
      };
    default:
      return {
        card: "bg-[#0b1020] text-[#dbe3ff] border-[#1b2445]",
        accent: "text-indigo-300",
        badge: "bg-indigo-500/90 text-white",
        subtle: "text-indigo-200/70",
        pill: "bg-white/5 hover:bg-white/10",
      };
  }
}

const iconClass = "w-4 h-4";

function toUrl(key: keyof SocialLinks, v: string) {
  if (!v) return "";
  const hasHttp = /^https?:\/\//i.test(v);
  const clean = v.trim();
  switch (key) {
    case "website":
      return hasHttp ? clean : `https://${clean}`;
    case "linkedin":
      return hasHttp ? clean : `https://linkedin.com/in/${clean}`;
    case "twitter":
      return hasHttp ? clean : `https://x.com/${clean.replace(/^@/, "")}`;
    case "instagram":
      return hasHttp ? clean : `https://instagram.com/${clean}`;
    case "facebook":
      return hasHttp ? clean : `https://facebook.com/${clean}`;
    case "youtube":
      return hasHttp ? clean : `https://youtube.com/${clean}`;
    case "github":
      return hasHttp ? clean : `https://github.com/${clean}`;
    case "whatsapp":
      if (hasHttp) return clean;
      const digits = clean.replace(/[^\d]/g, "");
      return `https://wa.me/${digits}`;
    default:
      return clean;
  }
}

function SocialRow({
  socials,
  pillClass,
}: {
  socials?: SocialLinks;
  pillClass: string;
}) {
  if (!socials) return null;
  const entries = (Object.keys(socials) as (keyof SocialLinks)[])
    .filter((k) => Boolean(socials[k]))
    .map((k) => ({ key: k, url: toUrl(k, socials[k] as string) }));
  if (entries.length === 0) return null;

  const Icon = (k: keyof SocialLinks) =>
    k === "website" ? (
      <Globe className={iconClass} />
    ) : k === "linkedin" ? (
      <Linkedin className={iconClass} />
    ) : k === "twitter" ? (
      <Twitter className={iconClass} />
    ) : k === "instagram" ? (
      <Instagram className={iconClass} />
    ) : k === "facebook" ? (
      <Facebook className={iconClass} />
    ) : k === "youtube" ? (
      <Youtube className={iconClass} />
    ) : k === "github" ? (
      <Github className={iconClass} />
    ) : k === "whatsapp" ? (
      <MessageCircle className={iconClass} />
    ) : null;

  return (
    <div className="absolute bottom-3 left-4 right-4 flex flex-wrap gap-2">
      {entries.map(({ key, url }, i) => (
        <a
          key={`${key}-${i}`}
          href={url}
          target="_blank"
          rel="noreferrer"
          className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full transition ${pillClass}`}
          title={key}
        >
          {Icon(key)}
          <span className="truncate max-w-[100px]">{key}</span>
        </a>
      ))}
    </div>
  );
}

/* =========================
 * Component
 * ========================= */
export default function CardPreview({
  data,
  showPlaceholders = true, // if false: hide empty fields (no dummies)
}: {
  data: CardData;
  showPlaceholders?: boolean;
}) {
  const t = themeClasses(data.theme);

  const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div
      className={`w-[360px] h-[208px] rounded-2xl border overflow-hidden shadow-xl flex p-4 relative ${t.card}`}
    >
      {/* subtle gradient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background:
            data.theme === "luxe"
              ? "radial-gradient(800px 200px at -10% -20%, #d6b35633, transparent 60%)"
              : data.theme === "minimal"
              ? "radial-gradient(800px 200px at -10% -20%, #11111111, transparent 60%)"
              : "radial-gradient(800px 200px at -10% -20%, #6366f133, transparent 60%)",
        }}
      />
      {children}
      <SocialRow
        socials={{ website: data.website, ...(data.socials || {}) }}
        pillClass={t.pill}
      />
    </div>
  );

  const Logo = () =>
    data.logoUrl ? (
      <img
        src={data.logoUrl}
        alt="logo"
        className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10"
      />
    ) : (
      <div className="w-12 h-12 rounded-xl grid place-items-center bg-white/5">
        {!showPlaceholders ? null : (
          <span className="text-xs opacity-60">LOGO</span>
        )}
      </div>
    );

  // show value or (if allowed) fallback placeholder; otherwise hide entirely
  const L = (val?: string, fallback?: string) =>
    val && val.trim() ? val : showPlaceholders ? fallback || "" : "";

  /* ---------- Layouts (unique per type) ---------- */

  const Business = () => (
    <Shell>
      <div className="flex w-full items-center gap-4">
        <Logo />
        <div className="flex-1">
          {L(data.name) && (
            <div className={`text-lg font-semibold leading-5 ${t.accent}`}>
              {L(data.name, "Full Name")}
            </div>
          )}
          {L(data.role) && (
            <div className={`text-xs ${t.subtle}`}>{L(data.role, "Founder / CEO")}</div>
          )}
          <div className="mt-2 text-[11px] space-y-0.5">
            {L(data.phone) && <div>{L(data.phone, "+91 9xxxxxxxxx")}</div>}
            {L(data.email) && <div>{L(data.email, "name@company.com")}</div>}
            {L(data.website) && (
              <div className="truncate">{L(data.website, "www.company.com")}</div>
            )}
          </div>
        </div>
        <div className={`text-[10px] px-2 py-1 rounded-full ${t.badge}`}>Business</div>
      </div>
      {L(data.address) && (
        <div className={`absolute bottom-10 left-4 right-4 text-[10px] ${t.subtle} truncate`}>
          {L(data.address, "Company Address, City, State")}
        </div>
      )}
    </Shell>
  );

  const Personal = () => (
    <Shell>
      <div className="flex flex-col justify-between w-full">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            {L(data.name) && (
              <div className={`text-xl font-semibold ${t.accent}`}>
                {L(data.name, "Your Name")}
              </div>
            )}
            {L(data.role) && (
              <div className={`text-xs ${t.subtle}`}>{L(data.role, "Professional Title")}</div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] mt-2">
          {L(data.phone) && <div>{L(data.phone, "Phone")}</div>}
          {L(data.email) && <div className="truncate">{L(data.email, "Email")}</div>}
          {L(data.website) && (
            <div className="truncate col-span-2">{L(data.website, "Website")}</div>
          )}
        </div>
        <div className="self-end text-[10px] opacity-70">Personal</div>
      </div>
    </Shell>
  );

  const Portfolio = () => (
    <Shell>
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between">
          <div>
            {L(data.name) && (
              <div className={`text-lg font-semibold ${t.accent}`}>
                {L(data.name, "Designer / Dev")}
              </div>
            )}
            {L(data.tagline) && (
              <div className={`text-xs ${t.subtle}`}>
                {L(data.tagline, "Crafting clean, modern interfaces.")}
              </div>
            )}
          </div>
          <Logo />
        </div>
        <div className="mt-4 text-[11px] grid grid-cols-2 gap-1">
          {L(data.email) && <div>{L(data.email, "email@me.com")}</div>}
          {L(data.website) && <div className="truncate">{L(data.website, "myportfolio.dev")}</div>}
          {L(data.phone) && <div className="col-span-2">{L(data.phone, "Phone")}</div>}
        </div>
        <div className="mt-auto self-end text-[10px] opacity-70">Portfolio</div>
      </div>
    </Shell>
  );

  const Event = () => (
    <Shell>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            {L(data.title) && (
              <div className={`text-lg font-semibold ${t.accent}`}>
                {L(data.title, "Event Pass")}
              </div>
            )}
            {L(data.name) && (
              <div className={`text-xs ${t.subtle}`}>{L(data.name, "Host / Contact")}</div>
            )}
          </div>
        </div>
        <div className="mt-3 text-[11px] grid grid-cols-2 gap-2">
          {L(data.eventDate) && <div className="truncate">{L(data.eventDate, "DD Mon, 7:00 PM")}</div>}
          {L(data.eventVenue) && <div className="truncate">{L(data.eventVenue, "Venue / City")}</div>}
          {L(data.website) && (
            <div className="col-span-2 truncate">{L(data.website, "eventsite.com")}</div>
          )}
        </div>
        <div className="mt-auto self-end text-[10px] opacity-70">Event</div>
      </div>
    </Shell>
  );

  switch (data.type) {
    case "personal":
      return <Personal />;
    case "portfolio":
      return <Portfolio />;
    case "event":
      return <Event />;
    default:
      return <Business />;
  }
}
