import React, { useEffect, useMemo, useState } from "react";

/**
 * Full-width fixed bottom banner with separate creatives for desktop and mobile.
 *
 * Backwards-compatible with the old API:
 * - If desktopImageUrl/mobileImageUrl are not provided, falls back to `imageUrl` for both.
 */
export default function BottomAd({
  href,
  // NEW: device-specific creatives
  desktopImageUrl,
  mobileImageUrl,
  // BACK-COMPAT: use this if you don't pass the device-specific ones
  imageUrl,
  alt = "Sponsored",

  // Appearance
  desktopHeightPx = 96, // desktop/tablet height
  mobileHeightPx = 88,  // phone height
  bg = "bg-black/90",

  // Behavior
  showClose = false,
  rememberDismissHours = 24,
  delayMs = 0, // show after optional delay
}: {
  href: string;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  imageUrl?: string;       // fallback for both
  alt?: string;
  desktopHeightPx?: number;
  mobileHeightPx?: number;
  bg?: string;
  showClose?: boolean;
  rememberDismissHours?: number;
  delayMs?: number;
}) {
  // Resolve sources with back-compat fallback
  const desktopSrc = desktopImageUrl || imageUrl || "";
  const mobileSrc = mobileImageUrl || imageUrl || desktopSrc;

  // Remember dismissal only if close is shown
  const storageKey = useMemo(
    () => `bottom-ad:dismiss:${href}:${desktopSrc}:${mobileSrc}`,
    [href, desktopSrc, mobileSrc]
  );

  const shouldShowInitially = () => {
    if (!showClose) return true;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return true;
      const { t } = JSON.parse(raw) as { t: number };
      return Date.now() - t > rememberDismissHours * 3600 * 1000;
    } catch {
      return true;
    }
  };

  const [open, setOpen] = useState(false);

  // Show after optional delay (and only if not remembered as dismissed)
  useEffect(() => {
    if (!shouldShowInitially()) return;
    const id = setTimeout(() => setOpen(true), Math.max(0, delayMs || 0));
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delayMs, storageKey]);

  if (!open || !desktopSrc) return null;

  /** iOS safe-area padding for home indicator */
  const safePad = "env(safe-area-inset-bottom)";

  const onClose = () => {
    setOpen(false);
    if (showClose) {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ t: Date.now() }));
      } catch { /* ignore */ }
    }
  };

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[60] ${bg}`}
      aria-label="Sponsored banner"
      style={{ paddingBottom: safePad }}
    >
      <div className="relative">
        {/* Close button (optional) */}
        {showClose && (
          <button
            onClick={onClose}
            className="absolute right-2 top-2 z-10 rounded-full bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}

        {/* MOBILE banner */}
        {/* MOBILE banner — full-bleed */}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full md:hidden"
          style={{
            height: mobileHeightPx,           // your existing height
            lineHeight: 0,
            // FULL-BLEED TRICK: span entire viewport width even inside a padded container
            width: "100vw",
            marginLeft: "calc(50% - 50vw)",
            marginRight: "calc(50% - 50vw)",
          }}
        >
          <img
            src={mobileSrc /* or imageUrl in your version */}
            alt={alt}
            className="h-full w-full object-cover"  // fill width; change to object-contain if you don't want any cropping
            decoding="async"
            loading="lazy"
          />
        </a>


        {/* DESKTOP/TABLET banner */}
        {/* DESKTOP/TABLET banner — full-bleed */}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:block"
          style={{
            height: desktopHeightPx,     // keep your chosen height
            lineHeight: 0,
            // FULL-BLEED across viewport (ignores page padding/max-width)
            width: "100vw",
            marginLeft: "calc(50% - 50vw)",
            marginRight: "calc(50% - 50vw)",
          }}
        >
          <img
            src={desktopSrc}
            alt={alt}
            className="h-full w-full object-cover object-center"  // <-- fills width, crops if needed
            decoding="async"
            loading="lazy"
          />
        </a>

      </div>
    </div>
  );
}
