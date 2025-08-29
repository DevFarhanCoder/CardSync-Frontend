// src/components/ShareButton.tsx
import React from "react";
import { Share2 } from "lucide-react";
import { toBlob } from "html-to-image";

type Props = {
  targetId: string;          // element id to capture as image
  headline?: string;         // e.g., "Mohammad Farhan – Software Developer"
  website?: string;          // e.g., "https://instantlycards.com"
  extra?: string;            // extra copy between headline and website
  className?: string;
};

const defaultExtra =
  "👋 Hi everyone!\n" +
  "I just created my Digital Business Card with InstantlyCards in under a minute. " +
  "You can make yours too! 🚀";

export default function ShareButton({
  targetId,
  headline,
  website = "https://instantlycards.com",
  extra = defaultExtra,
  className,
}: Props) {
  const buildText = () => {
    const parts: string[] = [];
    if (headline) parts.push(`📇 ${headline}`);
    if (extra) parts.push(extra);
    if (website) parts.push(`👉 ${website}`);
    return parts.join("\n\n");
  };

  const handleShare = async () => {
    const text = buildText();
    const node = document.getElementById(targetId);

    try {
      if (node) {
        // Larger, crisper capture and deterministic bg for dark themes
        const blob = await toBlob(node, {
          cacheBust: true,
          backgroundColor: "#111827",
          pixelRatio: 2,
        });

        if (blob) {
          const file = new File([blob], "card.png", { type: "image/png" });
          // @ts-ignore
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            // @ts-ignore
            await navigator.share({ files: [file], text });
            return;
          }
        }
      }
    } catch (err) {
      // Most common causes:
      // - CORS-tainted images inside the card (logo/bg from another domain w/o CORS)
      // - Non-HTTPS context (except localhost)
      console.error("Share (with image) failed; falling back to WhatsApp Web:", err);
    }

    // Desktop/Web fallback (text only; WhatsApp Web cannot accept pre-attached files)
    const wa = "https://wa.me/?text=" + encodeURIComponent(text);
    window.open(wa, "_blank");
  };

  return (
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
  );
}
