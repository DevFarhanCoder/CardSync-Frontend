import React, { useState } from "react";
import { Share2 } from "lucide-react";
import { toBlob } from "html-to-image";

/** The card shape can vary; we handle common places + deep fallbacks. */
type CardData = Record<string, any>;

type Props = {
  /** DOM element id for the CardPreview wrapper to screenshot */
  targetId: string;
  /** Full card payload */
  data: CardData;
  /** Your promo URL */
  ctaUrl?: string;
  /** Optional: override button classes */
  className?: string;
  /** Auto-open WA after image share */
  openWAAfterShare?: boolean;
  /** Set true to console.debug where values were picked from */
  debugKeys?: boolean;
};

/* ---------------- utilities ---------------- */

function ensureHttp(u?: string) {
  if (!u) return "";
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}
function normalizeDigits(v?: string) {
  return v ? v.replace(/[^\d]/g, "") : "";
}
function mapHref(address?: string, direct?: string) {
  if (direct) return direct;
  if (!address) return "";
  return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
}
function looksLikeUrl(v?: string) {
  if (!v) return false;
  return v.includes(".") || v.includes("/");
}

/** Shallow pick by exact path (e.g. ["extra","company","companyName"]) */
function getPath(obj: any, path: string[]) {
  let cur = obj;
  for (const k of path) {
    if (cur && typeof cur === "object" && k in cur) cur = cur[k];
    else return "";
  }
  return typeof cur === "string" ? cur.trim() : "";
}

/**
 * deepScan:
 * Walks the whole object and returns the first string value whose key
 * matches any alias (equals or contains, case-insensitive).
 * Optionally restrict to nodes whose ancestor path includes "company" / "co".
 */
function deepScan(
  obj: any,
  aliases: string[],
  preferCompanyContext = true
): { value: string; keyPath: string[] } {
  const wanted = aliases.map((a) => a.toLowerCase());
  const stack: Array<{ node: any; path: string[] }> = [{ node: obj, path: [] }];

  while (stack.length) {
    const { node, path } = stack.pop()!;
    if (!node || typeof node !== "object") continue;

    for (const [k, v] of Object.entries(node)) {
      const nextPath = [...path, k];

      if (v && typeof v === "object") {
        stack.push({ node: v, path: nextPath });
      } else if (typeof v === "string") {
        const keyLC = k.toLowerCase();
        const match =
          wanted.includes(keyLC) ||
          wanted.some((w) => keyLC.includes(w)); // includes covers variants like companyEmailId

        if (match) {
          // If preferring company context, ensure some ancestor mentions company/co
          if (preferCompanyContext) {
            const hasCompanyAncestor = nextPath.some((p) => /(^|_)co(mpany)?/i.test(p));
            if (!hasCompanyAncestor) continue; // skip if not under company-ish path
          }
          const value = v.trim();
          if (value) return { value, keyPath: nextPath };
        }
      }
    }
  }
  return { value: "", keyPath: [] };
}

/** Prefer known paths, then deep search (company context), then plain deep search. */
function pickBusinessField(
  data: any,
  candidates: Array<string[]>, // explicit paths first
  aliases: string[],           // names/partials to match
  debugKey?: (k: string, src: string, path?: string[]) => void
) {
  // 1) explicit paths
  for (const p of candidates) {
    const val = getPath(data, p);
    if (val) {
      debugKey?.(aliases[0], "path", p);
      return val;
    }
  }
  // 2) deep in company context
  const { value: ctxVal, keyPath: ctxPath } = deepScan(data, aliases, true);
  if (ctxVal) {
    debugKey?.(aliases[0], "deep-company", ctxPath);
    return ctxVal;
  }
  // 3) deep anywhere
  const { value, keyPath } = deepScan(data, aliases, false);
  if (value) {
    debugKey?.(aliases[0], "deep-any", keyPath);
    return value;
  }
  return "";
}

/* ---------- Social URL normalization (no GitHub as requested) ---------- */

function socialUrl(kind: "linkedin" | "twitter" | "instagram" | "facebook" | "youtube" | "telegram" | "whatsapp", raw?: string) {
  if (!raw) return "";

  const v = raw.trim();

  // WhatsApp: allow wa.me URL or phone
  if (kind === "whatsapp") {
    if (/^https?:\/\//i.test(v)) return v;
    const digits = normalizeDigits(v);
    return digits ? `https://wa.me/${digits}` : "";
  }

  // Telegram: @user or URL
  if (kind === "telegram") {
    if (looksLikeUrl(v)) return ensureHttp(v);
    return v.startsWith("@") ? `https://t.me/${v.slice(1)}` : `https://t.me/${v}`;
  }

  // Others: keep URL/domain; else build from handle
  if (looksLikeUrl(v)) return ensureHttp(v);
  const handle = v.replace(/^@/, "");
  switch (kind) {
    case "linkedin":
      return `https://www.linkedin.com/in/${handle}`;
    case "twitter":
      return `https://x.com/${handle}`;
    case "instagram":
      return `https://instagram.com/${handle}`;
    case "facebook":
      return `https://facebook.com/${handle}`;
    case "youtube":
      return `https://youtube.com/${handle}`;
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
  debugKeys = false,
}: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const dbg: Array<{ field: string; src: string; path?: string[] }> = [];
  const debugKey = debugKeys
    ? (field: string, src: string, path?: string[]) => dbg.push({ field, src, path })
    : undefined;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  // --- PERSONAL ---
  const name = pickBusinessField(
    data,
    [["name"]],
    ["name"],
    debugKey
  );
  const role = pickBusinessField(
    data,
    [["role"], ["designation"]],
    ["role", "designation"],
    debugKey
  );
  const phone = pickBusinessField(
    data,
    [["phone"], ["personalPhone"]],
    ["phone", "mobile", "contact"],
    debugKey
  );
  const email = pickBusinessField(
    data,
    [["email"]],
    ["email"],
    debugKey
  );
  const website = pickBusinessField(
    data,
    [["website"]],
    ["website", "site", "url"],
    debugKey
  );
  const address = pickBusinessField(
    data,
    [["address"], ["personalAddress"]],
    ["address", "location"],
    debugKey
  );
  const mapsDirect = pickBusinessField(
    data,
    [["googleMaps"], ["addressMap"], ["mapsLink"]],
    ["googlemaps", "mapslink", "map"],
    debugKey
  );

  // --- BUSINESS (super tolerant) ---
  const companyName = pickBusinessField(
    data,
    [
      ["companyName"],
      ["company", "companyName"],
      ["company", "name"],
      ["extra", "company", "companyName"],
      ["extra", "company", "name"],
      ["coName"],
    ],
    ["companyname", "coname", "name"],
    debugKey
  );
  const businessCategory = pickBusinessField(
    data,
    [
      ["businessCategory"],
      ["company", "category"],
      ["extra", "company", "category"],
      ["companyCategory"],
    ],
    ["category", "businesscategory"],
    debugKey
  );
  const companyPhone = pickBusinessField(
    data,
    [
      ["companyPhone"],
      ["company", "phone"],
      ["company", "mobile"],
      ["company", "mobNo"],
      ["company", "companyMobile"],
      ["companyMobNo"],
    ],
    ["phone", "mobile", "mob", "contact"],
    debugKey
  );
  const companyEmail = pickBusinessField(
    data,
    [["companyEmail"], ["company", "email"], ["company", "emailId"], ["companyEmailId"]],
    ["email", "emailid"],
    debugKey
  );
  const companyWebsite = pickBusinessField(
    data,
    [["companyWebsite"], ["company", "website"], ["coWebsite"]],
    ["website", "site", "url"],
    debugKey
  );
  const companyAddress = pickBusinessField(
    data,
    [["companyAddress"], ["company", "address"], ["coAddress"]],
    ["address", "location"],
    debugKey
  );
  const companyMap = pickBusinessField(
    data,
    [["companyMap"], ["company", "maps"], ["company", "googleMaps"], ["companyMaps"], ["coMaps"]],
    ["maps", "map", "googlemaps"],
    debugKey
  );
  const companyMessage = pickBusinessField(
    data,
    [["message"], ["company", "message"], ["extra", "company", "message"]],
    ["message", "note", "about"],
    debugKey
  );

  // --- SOCIALS (merge top-level + nested) (GitHub excluded on purpose) ---
  const socialsMerged = {
    linkedin: data.linkedin ?? data?.socials?.linkedin,
    twitter: data.twitter ?? data?.socials?.twitter,
    instagram: data.instagram ?? data?.socials?.instagram,
    facebook: data.facebook ?? data?.socials?.facebook,
    youtube: data.youtube ?? data?.socials?.youtube,
    whatsapp: data.whatsapp ?? data?.socials?.whatsapp,
    telegram: data.telegram ?? data?.socials?.telegram,
  };

  /** Build caption in your exact layout (no emojis). */
  const buildText = () => {
    const out: string[] = [];

    // Promo first
    out.push(
      "I created my Digital Business Card with Instantly-Cards in under a minute.",
      "You can make yours too!",
      ctaUrl,
      ""
    );

    // Personal details
    out.push("Personal Details -");
    if (name) out.push(`Name - ${name}`);
    if (role) out.push(`Designation - ${role}`);
    if (phone) out.push(`Contact - ${phone}`);
    if (email) out.push(`Email Address - ${email}`);
    if (website) out.push(`Website - ${ensureHttp(website)}`);
    if (address) out.push(`Location - ${address}`);
    const gmap = mapHref(address, mapsDirect);
    if (gmap) out.push(`Google Maps Link - ${gmap}`);

    // Business profile (only if any field exists)
    const anyBiz =
      companyName ||
      businessCategory ||
      companyPhone ||
      companyEmail ||
      companyWebsite ||
      companyAddress ||
      companyMap ||
      companyMessage;

    if (anyBiz) {
      out.push("", "Business Profile -");
      if (companyName) out.push(`Company Name - ${companyName}`);
      if (businessCategory) out.push(`Business Category - ${businessCategory}`);
      if (companyPhone) out.push(`Company Contact - ${companyPhone}`);
      if (companyEmail) out.push(`Company Email - ${companyEmail}`);
      if (companyWebsite) out.push(`Company Website - ${ensureHttp(companyWebsite)}`);
      if (companyAddress) out.push(`Company Address - ${companyAddress}`);
      const cmap = mapHref(companyAddress, companyMap);
      if (cmap) out.push(`Company Maps Link - ${cmap}`);
      if (companyMessage) out.push(`Message - ${companyMessage}`);
    }

    // Social Links (GitHub skipped)
    const socialsLines: string[] = [];
    if (socialsMerged.linkedin) socialsLines.push(`• LinkedIn: ${socialUrl("linkedin", socialsMerged.linkedin)}`);
    if (socialsMerged.twitter)  socialsLines.push(`• X/Twitter: ${socialUrl("twitter", socialsMerged.twitter)}`);
    if (socialsMerged.instagram) socialsLines.push(`• Instagram: ${socialUrl("instagram", socialsMerged.instagram)}`);
    if (socialsMerged.facebook) socialsLines.push(`• Facebook: ${socialUrl("facebook", socialsMerged.facebook)}`);
    if (socialsMerged.youtube)  socialsLines.push(`• YouTube: ${socialUrl("youtube", socialsMerged.youtube)}`);
    const wa = socialUrl("whatsapp", socialsMerged.whatsapp);
    if (wa) socialsLines.push(`• WhatsApp: ${wa}`);
    if (socialsMerged.telegram) socialsLines.push(`• Telegram: ${socialUrl("telegram", socialsMerged.telegram)}`);

    if (socialsLines.length) {
      out.push("", "Social Links -", ...socialsLines);
    }

    return out.join("\n");
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

    // Try to share the image first (mobile with Web Share Level 2)
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
            } catch {
              /* user cancelled; continue to text */
            }
          }
        }
      }
    } catch {
      /* continue to text step */
    }

    // Always copy + open WA with text
    await copyToClipboard(text);
    if (openWAAfterShare) openWhatsAppWithText(text);

    // Dev help: see where we pulled values from
    if (debugKeys && dbg.length) {
      // eslint-disable-next-line no-console
      console.debug("[ShareButton] picked keys:", dbg);
    }
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
