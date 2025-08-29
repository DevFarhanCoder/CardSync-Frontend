import React, { useState } from "react";
import { Share2 } from "lucide-react";
import { toBlob } from "html-to-image";

type Props = {
  /** DOM element id to capture as image (the inner card container) */
  targetId: string;
  /** e.g. "Mohammad Farhan – Software Developer" */
  headline?: string;
  /** e.g. "https://instantlycards.com" */
  website?: string;
  /** extra lines after the headline (emoji-friendly) */
  extra?: string;
  /** optional custom class for the button */
  className?: string;
  /** set false if you *don't* want to auto-open WhatsApp after the image share */
  openWAAfterShare?: boolean;
};

const defaultExtra =
  "👋 Hi everyone!\n" +
  "I just created my Digital Business Card with InstantlyCards in under a minute.\n" +
  "You can make yours too! 🚀";

export default function ShareButton({
  targetId,
  headline,
  website = "https://instantlycards.com",
  extra = defaultExtra,
  className,
  openWAAfterShare = true,
}: Props) {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  const buildText = () => {
    const parts: string[] = [];
    if (headline) parts.push(`📇 ${headline}`);
    if (extra) parts.push(extra);
    if (website) parts.push(`👉 ${website}`);
    return parts.join("\n\n");
  };

  const openWhatsAppWithText = (text: string) => {
    const wa = "https://wa.me/?text=" + encodeURIComponent(text);
    window.open(wa, "_blank");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard?.writeText(text);
      showToast("Caption copied — paste to send");
    } catch {
      // ignore; clipboard not allowed
    }
  };

  const handleShare = async () => {
    const text = buildText();

    // 1) Try to share the IMAGE via native share sheet (mobile)
    try {
      const node = document.getElementById(targetId);
      if (node) {
        const blob = await toBlob(node, {
          cacheBust: true,
          backgroundColor: "#111827", // dark bg for card
          pixelRatio: 2,               // crisp image
        });

        if (blob) {
          const file = new File([blob], "card.png", { type: "image/png" });

          // @ts-ignore - Web Share Level 2 (files)
          const canFiles = navigator.canShare && navigator.canShare({ files: [file] });

          if (canFiles) {
            try {
              // @ts-ignore
              await navigator.share({ files: [file] }); // intentionally omit text (WhatsApp tends to drop it anyway)
            } catch {
              /* user cancelled or share failed; continue to text step */
            }
          }
        }
      }
    } catch {
      /* capture failed (CORS / non-HTTPS) — continue to text step */
    }

    // 2) Always copy the text & open WhatsApp with the text prefilled
    //    (Works on desktop & mobile; user can paste the caption if needed)
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
