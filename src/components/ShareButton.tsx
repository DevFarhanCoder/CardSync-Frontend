import React, { useState } from "react";
import { Share2 } from "lucide-react";
import { toBlob } from "html-to-image";

type CardData = {
  name?: string;
  role?: string;

  phone?: string;
  email?: string;
  website?: string;

  address?: string;
  googleMaps?: string;

  // sometimes present at top level
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  github?: string;
  whatsapp?: string;
  telegram?: string;

  // often present here in your app
  socials?: Partial<{
    linkedin: string;
    twitter: string;   // Twitter/X
    instagram: string;
    facebook: string;
    youtube: string;
    github: string;
    whatsapp: string;  // number or wa.me
    telegram: string;  // @user or url
  }>;

  extra?: any;
};

type Props = {
  targetId: string;
  data: CardData;
  ctaUrl?: string;
  className?: string;
  openWAAfterShare?: boolean;
};

/* ---------------- helpers ---------------- */

function ensureHttp(u?: string) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
}

function normalizeDigits(v?: string) {
  return v ? v.replace(/[^\d]/g, "") : "";
}

function mapHref(address?: string, direct?: string) {
  if (direct) return direct;
  if (!address) return "";
  return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
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
    case "github":
      return /^https?:\/\//i.test(v) ? v : `https://github.com/${v.replace(/^@/, "")}`;
    case "telegram":
      return v.startsWith("@") ? `https://t.me/${v.slice(1)}` : ensureHttp(v);
    case "whatsapp":
      if (/^https?:\/\//i.test(v)) return v;
      return `https://wa.me/${normalizeDigits(v)}`;
    default:
      return ensureHttp(v);
  }
}

/* ---------------- component ---------------- */

export default function ShareButton({
  targetId,
  data,
  ctaUrl = "https://instantllycards.com",
  className,
  openWAAfterShare = true,
}: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  // merge socials from both top-level and data.socials
  const socials = {
    ...(data.socials || {}),
    linkedin: data.linkedin ?? data.socials?.linkedin,
    twitter: data.twitter ?? data.socials?.twitter,
    instagram: data.instagram ?? data.socials?.instagram,
    facebook: data.facebook ?? data.socials?.facebook,
    youtube: data.youtube ?? data.socials?.youtube,
    github: data.github ?? data.socials?.github,
    whatsapp: data.whatsapp ?? data.socials?.whatsapp,
    telegram: data.telegram ?? data.socials?.telegram,
  };

  /** Build WhatsApp caption: promo first, then full profile */
  const buildText = () => {
    const parts: string[] = [];

    // 1) Promo (your requested order)
    parts.push(
      "I created my Digital Business Card with Instantly-Cards in under a minute.",
      "You can make yours too!",
      `👉 ${ctaUrl}`,
      "" // blank line
    );

    // 2) Identity
    const header = [data.name, data.role].filter(Boolean).join(" — ");
    if (header) parts.push(`👤 ${header}`);

    // 3) Contacts
    if (data.phone) parts.push(`📞 ${data.phone}`);
    if (data.email) parts.push(`✉️ ${data.email}`);
    if (data.website) parts.push(`🌐 ${ensureHttp(data.website)}`);

    const maps = mapHref(data.address, data.googleMaps);
    if (maps) parts.push(`📍 ${maps}`);

    // 4) Socials (only filled)
    const sLines: string[] = [];
    if (socials.linkedin)  sLines.push(`🔗 LinkedIn: ${socialHref("linkedin",  socials.linkedin)}`);
    if (socials.twitter)   sLines.push(`🐦 Twitter: ${socialHref("twitter",   socials.twitter)}`);
    if (socials.instagram) sLines.push(`📸 Instagram: ${socialHref("instagram", socials.instagram)}`);
    if (socials.facebook)  sLines.push(`📘 Facebook: ${socialHref("facebook",  socials.facebook)}`);
    if (socials.youtube)   sLines.push(`▶️ YouTube: ${socialHref("youtube",   socials.youtube)}`);
    if (socials.github)    sLines.push(`💻 GitHub: ${socialHref("github",    socials.github)}`);
    if (socials.whatsapp)  sLines.push(`💬 WhatsApp: ${socialHref("whatsapp",  socials.whatsapp)}`);
    if (socials.telegram)  sLines.push(`✈️ Telegram: ${socialHref("telegram",  socials.telegram)}`);

    if (sLines.length) {
      parts.push("", ...sLines);
    }

    return parts.join("\n");
  };

  const openWhatsAppWithText = (text: string) => {
    window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard?.writeText(text);
      showToast("Caption copied — paste to send");
    } catch {
      /* ignore permission errors */
    }
  };

  const handleShare = async () => {
    const text = buildText();

    // 1) Try to share an image first (mobile with Web Share Level 2)
    try {
      const node = document.getElementById(targetId);
      if (node) {
        const blob = await toBlob(node, {
          cacheBust: true,
          backgroundColor: "#0B0F14",
          pixelRatio: 2,
        });
        if (blob) {
          const file = new File([blob], "card.png", { type: "image/png" });
          // @ts-ignore
          const canFiles = navigator.canShare && navigator.canShare({ files: [file] });
          if (canFiles) {
            try {
              // @ts-ignore
              await navigator.share({ files: [file] });
            } catch { /* user cancelled */ }
          }
        }
      }
    } catch { /* continue to text step */ }

    // 2) Always copy + open WA with text
    await copyToClipboard(text);
    if (openWAAfterShare) openWhatsAppWithText(text);
  };

  return (
    <>
      <button
        onClick={handleShare}
        className={
          className ??
          "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium bg-green-500 hover:bg-green-400 text-black shadow"
        }
        title="Share to WhatsApp"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-[9999]">
          <div className="rounded-lg bg-black/90 text-white text-xs font-medium px-3 py-2 shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </>
  );
}
