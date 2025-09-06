// src/components/share/ShareDialog.tsx
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import Select, { type Option } from "@/components/ui/Select";
import { getJson, postJson } from "@/lib/api";

type Room = { id: string; name: string; code: string };
type TabKey = "group" | "qr" | "inapp";

function slugify(s: string) {
  return (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60) || "card";
}

export default function ShareDialog({
  open,
  onClose,
  card,
  ownerHandle,
}: {
  open: boolean;
  onClose: () => void;
  card: { _id: string; title: string; slug?: string };
  ownerHandle: string;
}) {
  // Default to QR since “Link” tab is removed
  const [tab, setTab] = useState<TabKey>("qr");

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState<string>("");

  const [shareUrl, setShareUrl] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loadingShare, setLoadingShare] = useState<boolean>(false);

  const [toast, setToast] = useState<string | null>(null);

  // Fallback pretty URL if backend doesn’t return one
  const fallbackPrettyUrl = useMemo(() => {
    const origin = window.location.origin.replace(/\/+$/, "");
    const slug = card.slug || slugify(card.title);
    return `${origin}/${ownerHandle}/${slug}`;
  }, [card.title, card.slug, ownerHandle]);

  function pushToast(t: string) {
    setToast(t);
    window.setTimeout(() => setToast(null), 1600);
  }

  async function loadRooms() {
    try {
      const r = await getJson("/api/chat/rooms");
      setRooms((r.rooms || []).map((x: any) => ({ id: x.id, name: x.name, code: x.code })));
    } catch {
      // silently ignore; the Group tab will just show empty options
    }
  }

  async function createShareUrl() {
    setLoadingShare(true);
    try {
      // Prefer backend-generated pretty URL
      const r = await postJson(`/api/cards/${card._id}/share`, {});
      const url = (r && r.shareUrl) ? String(r.shareUrl) : fallbackPrettyUrl;
      setShareUrl(url);
      // Generate QR image for that URL
      const dataUrl = await QRCode.toDataURL(url, { margin: 1, scale: 6 });
      setQrDataUrl(dataUrl);
    } catch {
      // Fall back to client-side pretty URL even if API call fails (e.g., 401)
      setShareUrl(fallbackPrettyUrl);
      const dataUrl = await QRCode.toDataURL(fallbackPrettyUrl, { margin: 1, scale: 6 });
      setQrDataUrl(dataUrl);
    } finally {
      setLoadingShare(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    setTab("qr");
    loadRooms();
    createShareUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, card._id]);

  // Keep selected room valid if the list refreshes
  useEffect(() => {
    if (rooms.length && !rooms.find((r) => r.id === roomId)) setRoomId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms.length]);

  if (!open) return null;

  const roomOptions: Option[] = rooms.map((r) => ({
    value: r.id,
    label: `${r.name} (${r.code})`,
  }));

  async function shareToGroup() {
    if (!roomId) return pushToast("Choose a group");
    await postJson("/api/shares/group", { cardId: card._id, roomId });
    pushToast("Shared to group");
  }

  return (
    <div className="fixed inset-0 z-[70]">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/90" onClick={onClose} />

      {/* sheet on mobile, centered on desktop */}
      <div
        className="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2
                   md:-translate-x-1/2 md:-translate-y-1/2 md:bottom-auto p-3 md:p-0"
      >
        <div
          className="w-full md:w-[560px] max-w-[100vw]
                     rounded-2xl border border-[var(--border)] bg-[#12161b]
                     shadow-2xl overflow-hidden"
        >
          {/* header */}
          <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between bg-[#11151a]">
            <div className="font-semibold">Share “{card.title || "Card"}”</div>
            <button className="chip" onClick={onClose}>✕</button>
          </div>

          {/* tabs (LINK removed) */}
          <div className="px-4 py-3 flex flex-wrap gap-2 bg-[#12161b]">
            {[
              { k: "group", label: "GROUP" },
              { k: "qr", label: "QR" },
              { k: "inapp", label: "INAPP" },
            ].map((t) => (
              <button
                key={t.k}
                className={`px-3 py-1.5 rounded-full border border-[var(--border)]
                  ${tab === (t.k as TabKey)
                    ? "bg-yellow-500 text-black"
                    : "bg-[#11151a] text-white hover:bg-[#1a1f26]"}`}
                onClick={() => setTab(t.k as TabKey)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* body */}
          <div className="px-4 pb-5 bg-[#12161b]">
            {/* GROUP */}
            {tab === "group" && (
              <div className="rounded-xl border border-[var(--border)] p-4 space-y-3 bg-[#0f1419]">
                <div className="text-sm text-[var(--subtle)]">
                  Select a group to post your card link.
                </div>
                <Select
                  value={roomId}
                  onChange={setRoomId}
                  options={roomOptions}
                  className="w-full"
                />
                <div className="flex flex-wrap gap-2 pt-2">
                  <button className="btn btn-gold" onClick={shareToGroup}>
                    Share to group
                  </button>
                  <a className="btn" href="/dashboard/chat" target="_blank" rel="noreferrer">
                    Open Chat
                  </a>
                </div>
              </div>
            )}

            {/* QR (now shows the pretty link) */}
            {tab === "qr" && (
              <div className="rounded-xl border border-[var(--border)] p-4 grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-4 items-center bg-[#0f1419]">
                <div className="w-[160px] h-[160px] rounded-lg bg-[#0a0d12] grid place-items-center overflow-hidden mx-auto sm:mx-0">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-sm opacity-70">{loadingShare ? "Generating…" : "…"}</span>
                  )}
                </div>
                <div>
                  <div className="text-sm text-[var(--subtle)] mb-2">
                    Scanners will open this card (with your profile behind it).
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-xl bg-[#1b1f26] border border-[var(--border)] px-3 py-2"
                      value={shareUrl || (loadingShare ? "Generating…" : "")}
                      readOnly
                    />
                    <button
                      className="chip"
                      disabled={!shareUrl}
                      onClick={() =>
                        shareUrl
                          ? navigator.clipboard.writeText(shareUrl).then(() => pushToast("Copied"))
                          : undefined
                      }
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* INAPP */}
            {tab === "inapp" && (
              <div className="rounded-xl border border-[var(--border)] p-4 space-y-3 bg-[#0f1419]">
                <div className="text-sm text-[var(--subtle)]">
                  Share inside the app with people who already use Instantly-Cards.
                </div>
                <a className="btn" href="/dashboard/contacts" target="_blank" rel="noreferrer">
                  Sync contacts
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[80] bg-black/90 text-white text-sm px-4 py-2 rounded-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
