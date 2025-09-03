import React, { useEffect, useMemo, useState } from "react";

/**
 * Full-width bottom banner (fixed). Keeps aspect via object-contain to avoid cropping.
 * If showClose=false, no dismiss button or localStorage.
 */
export default function BottomAd({
  href,
  imageUrl,
  alt = "Sponsored",
  // appearance
  heightPx = 96,                 // ~96px desktop & mobile (adjust if you want)
  bg = "bg-black/90",            // backdrop behind the image
  // behavior
  showClose = false,             // <- NO cross by default per your request
  rememberDismissHours = 24,     // only used if showClose=true
  delayMs = 200,
}: {
  href: string;
  imageUrl: string;
  alt?: string;
  heightPx?: number;
  bg?: string;
  showClose?: boolean;
  rememberDismissHours?: number;
  delayMs?: number;
}) {
  // remember dismissal only if close is shown
  const storageKey = useMemo(
    () => `bottom-ad:dismiss:${href}:${imageUrl}`,
    [href, imageUrl]
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

  const [open, setOpen] = useState<boolean>(shouldShowInitially);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => setOpen(true), delayMs);
    return () => clearTimeout(id);
  }, [open, delayMs]);

  if (!open) return null;

  /** iOS safe-area padding for home indicator */
  const safePad = "env(safe-area-inset-bottom)";

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60]"
      aria-label="Sponsored banner"
    >
      {/* Full-bleed: remove max-w / mx-auto */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full"
        style={{
          height: heightPx,
          lineHeight: 0,
        }}
      >
        <img
          src={imageUrl}
          alt={alt}
          className="h-full w-full object-contain"   // keep aspect ratio, no cropping
          decoding="async"
          loading="lazy"
        />
      </a>
    </div>
  );

}
