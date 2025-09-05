import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import Select, { type Option } from "@/components/ui/Select";
import { getJson, postJson } from "@/lib/api";

type Room = { id: string; name: string; code: string };
type TabKey = "group" | "qr" | "link" | "inapp";

export default function ShareDialog({
    open,
    onClose,
    card,
    ownerHandle,
}: {
    open: boolean;
    onClose: () => void;
    card: { _id: string; title: string };
    ownerHandle: string;
}) {
    const [tab, setTab] = useState<TabKey>("group");
    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomId, setRoomId] = useState<string>("");
    const [qrUrl, setQrUrl] = useState<string>("");
    const [linkUrl, setLinkUrl] = useState<string>("");
    const [toast, setToast] = useState<string | null>(null);

    const shareProfile = useMemo(
        () => `${window.location.origin}/public/profile/${ownerHandle}/cards`,
        [ownerHandle]
    );

    function pushToast(t: string) {
        setToast(t);
        setTimeout(() => setToast(null), 1600);
    }

    async function makeQR() {
        const data = await QRCode.toDataURL(shareProfile, { margin: 1, scale: 6 });
        setQrUrl(data);
    }
    async function genLink() {
        const r = await postJson(`/api/cards/${card._id}/share`, {});
        setLinkUrl(r.shareUrl || `${window.location.origin}/share/${card._id}`);
    }
    async function loadRooms() {
        const r = await getJson("/api/chat/rooms");
        setRooms((r.rooms || []).map((x: any) => ({ id: x.id, name: x.name, code: x.code })));
    }

    useEffect(() => {
        if (!open) return;
        setTab("group");
        loadRooms();
        makeQR();
        genLink();
    }, [open]);

    useEffect(() => {
        if (rooms.length && !rooms.find((r) => r.id === roomId)) setRoomId("");
    }, [rooms.length]);

    if (!open) return null;

    const roomOptions: Option[] = rooms.map((r) => ({
        value: r.id,
        label: `${r.name} (${r.code})`,
    }));

    // …keep the rest of your file exactly as we made it in the last step…
    // ShareDialog.tsx
    async function shareToGroup() {
        if (!roomId) return pushToast("Choose a group");
        await postJson("/api/shares/group", { cardId: card._id, roomId });
        pushToast("Shared to group");
    }


    // …rest unchanged


    return (
        <div className="fixed inset-0 z-[70]">
            {/* OPAQUE overlay */}
            <div className="absolute inset-0 bg-black/90" onClick={onClose} />

            {/* sheet on mobile, centered on desktop */}
            <div className="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2
                      md:-translate-x-1/2 md:-translate-y-1/2 md:bottom-auto
                      p-3 md:p-0">
                <div
                    className="w-full md:w-[560px] max-w-[100vw]
                     rounded-2xl border border-[var(--border)] bg-[#12161b]
                     shadow-2xl overflow-hidden"
                >
                    {/* header */}
                    <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between bg-[#11151a]">
                        <div className="font-semibold">
                            Share “{card.title || "Card"}”
                        </div>
                        <button className="chip" onClick={onClose}>✕</button>
                    </div>

                    {/* tabs */}
                    <div className="px-4 py-3 flex flex-wrap gap-2 bg-[#12161b]">
                        {[
                            { k: "group", label: "GROUP" },
                            { k: "qr", label: "QR" },
                            { k: "link", label: "LINK" },
                            { k: "inapp", label: "INAPP" },
                        ].map((t) => (
                            <button
                                key={t.k}
                                className={`px-3 py-1.5 rounded-full border border-[var(--border)]
                            ${tab === t.k ? "bg-yellow-500 text-black" : "bg-[#11151a] text-white hover:bg-[#1a1f26]"}`}
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
                                    <button className="btn btn-gold" onClick={shareToGroup}>Share to group</button>
                                    <a className="btn" href="/dashboard/chat" target="_blank" rel="noreferrer">
                                        Open Chat
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* QR */}
                        {tab === "qr" && (
                            <div className="rounded-xl border border-[var(--border)] p-4 grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-4 items-center bg-[#0f1419]">
                                <div className="w-[160px] h-[160px] rounded-lg bg-[#0a0d12] grid place-items-center overflow-hidden mx-auto sm:mx-0">
                                    {qrUrl ? <img src={qrUrl} alt="QR" className="w-full h-full object-contain" /> : "…"}
                                </div>
                                <div>
                                    <div className="text-sm text-[var(--subtle)] mb-2">
                                        Scanners will open your public profile with all your cards.
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            className="flex-1 rounded-xl bg-[#1b1f26] border border-[var(--border)] px-3 py-2"
                                            value={shareProfile}
                                            readOnly
                                        />
                                        <button
                                            className="chip"
                                            onClick={() => navigator.clipboard.writeText(shareProfile).then(() => pushToast("Copied"))}
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* LINK */}
                        {tab === "link" && (
                            <div className="rounded-xl border border-[var(--border)] p-4 space-y-3 bg-[#0f1419]">
                                <div className="text-sm text-[var(--subtle)]">
                                    This link opens the selected card (requires sign-in).
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 rounded-xl bg-[#1b1f26] border border-[var(--border)] px-3 py-2"
                                        value={linkUrl || "Generating…"}
                                        readOnly
                                    />
                                    <button
                                        className="chip"
                                        onClick={() =>
                                            navigator.clipboard.writeText(linkUrl || "").then(() => pushToast("Copied"))
                                        }
                                        disabled={!linkUrl}
                                    >
                                        Copy
                                    </button>
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
