import { useEffect, useState } from "react";
import { X } from "lucide-react";

/**
 * Full-width fixed bottom banner (no radius, no border).
 * Uses a CSS background image with `background-size: cover`
 * so the creative always fills the bar perfectly.
 */
type Props = {
  href: string;                     // click-through
  imageUrl?: string;                // background banner (recommended)
  alt?: string;                     // for aria-label when image is used
  ttlHours?: number;                // remember dismissal for this many hours
  showDelayMs?: number;             // delay before showing
  storageKey?: string;              // localStorage key for dismissal
  height?: { mobile: number; desktop: number }; // px heights
  className?: string;
};

export default function BottomAd({
  href,
  imageUrl,
  alt = "Advertisement",
  ttlHours = 24,
  showDelayMs = 250,
  storageKey = "ic_bottom_ad_dismissed_until",
  height = { mobile: 96, desktop: 120 },
  className,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const ts = localStorage.getItem(storageKey);
    const now = Date.now();
    if (!ts || now > Number(ts)) {
      const t = setTimeout(() => setOpen(true), showDelayMs);
      return () => clearTimeout(t);
    }
  }, [showDelayMs, storageKey]);

  const dismiss = () => {
    const until = Date.now() + ttlHours * 60 * 60 * 1000;
    localStorage.setItem(storageKey, String(until));
    setOpen(false);
  };

  if (!open) return null;

  // We paint as a background so it always fits (cover).
  const backgroundStyles: React.CSSProperties = imageUrl
    ? {
        backgroundImage: `url("${imageUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : {};

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[1000] ${className || ""}`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-live="polite"
    >
      <div
        className="relative w-full overflow-hidden bg-[var(--surface)]/95 backdrop-blur"
        style={{
          // Full width, square corners, subtle lift
          boxShadow: "0 10px 30px rgba(0,0,0,.35)",
          // Use CSS custom property for height so we can modify via media query below
          // @ts-ignore -- CSS var is fine
          ["--adH" as any]: `${height.mobile}px`,
          height: `var(--adH)`,
          ...backgroundStyles,
        }}
        role={imageUrl ? "img" : undefined}
        aria-label={imageUrl ? alt : undefined}
      >
        {/* Close (X) */}
        <button
          aria-label="Close advertisement"
          onClick={dismiss}
          className="absolute right-2 top-2 h-8 w-8 grid place-items-center rounded-full bg-black/60 text-white hover:bg-black/75"
        >
          <X size={16} />
        </button>

        {/* Clickable area (full bleed) */}
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="block w-full h-full focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
          aria-label={alt}
        >
          {/* Fallback text ad if no imageUrl provided */}
          {!imageUrl && (
            <div className="flex items-center justify-between h-full px-4 md:px-6">
              <div className="min-w-0">
                <div className="text-base md:text-lg font-semibold">
                  Limited-time offer on Barter Adverts.
                </div>
                <div className="text-xs md:text-sm text-[var(--subtle)] truncate">
                  Swap & save with verified listings. Tap to explore.
                </div>
              </div>
              <span className="shrink-0 inline-flex items-center justify-center rounded-xl bg-[var(--gold)] text-black font-semibold px-3 py-2 md:px-4 md:py-2">
                Visit
              </span>
            </div>
          )}
        </a>

        {/* Desktop height via media query */}
        <style>
          {`
            @media (min-width: 768px) {
              .fixed.inset-x-0.bottom-0.z-\\[1000\\] > div {
                --adH: ${height.desktop}px;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
}
