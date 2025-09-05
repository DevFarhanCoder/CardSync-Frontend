import CardPreview from "@/components/CardPreview";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJson } from "@/lib/api";

type Msg = {
  id: string; roomId: string; userId: string;
  text?: string;
  kind?: "text" | "card";
  payload?: any;
  createdAt: string;
};

export default function MessageList({ items, currentUserId }: { items: Msg[]; currentUserId: string }) {
  const nav = useNavigate();
  const rows = useMemo(() => items.map(m => ({ ...m, mine: String(m.userId) === String(currentUserId) })), [items, currentUserId]);

  // lazy fallback: if a message says it's a card but has no data, fetch it
  const [cache, setCache] = useState<Record<string, any>>({});
  useEffect(() => {
    const missing = rows.filter(m => (m.kind === "card" || m.payload?.cardId) && !m.payload?.data && !cache[m.payload?.cardId || ""]);
    (async () => {
      for (const m of missing) {
        const id = m.payload?.cardId;
        if (!id) continue;
        try {
          const r = await getJson(`/api/public/card/${id}`);
          setCache((prev) => ({ ...prev, [id]: r.card?.data || {} }));
        } catch { /* ignore */ }
      }
    })();
  }, [rows, cache]);

  return (
    <div className="h-full min-h-0 overflow-y-auto p-4 space-y-3">
      {rows.map((m) => {
        const isCard = m.kind === "card" || !!m.payload?.cardId;
        const cardData = isCard ? (m.payload?.data || cache[m.payload?.cardId || ""]) : null;

        return (
          <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl border border-[var(--border)] p-3 ${m.mine ? "bg-[#1b1f26]" : "bg-[#12161b]"}`}>
              {!isCard ? (
                <>
                  {m.text ? <div className="whitespace-pre-wrap">{m.text}</div> : null}
                  <div className="text-[10px] text-[var(--subtle)] mt-1">
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-xl border border-[var(--border)] bg-[#0f1419] p-3">
                    <div className="text-sm font-semibold mb-2">{m.payload?.title || "Card"}</div>
                    <div className="rounded-lg overflow-hidden bg-[var(--muted)] grid place-items-center min-h-[140px]">
                      {cardData ? (
                        <CardPreview id={`msg-${m.id}`} data={cardData} />
                      ) : (
                        <div className="text-[var(--subtle)] text-sm p-6">Loading card…</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-[10px] text-[var(--subtle)]">
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </div>
                    <button
                      className="chip"
                      onClick={() =>
                        nav(`/public/profile/${m.payload?.ownerId}/cards?card=${m.payload?.cardId}`)
                      }
                    >
                      View
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
      {!rows.length && <div className="text-[var(--subtle)] text-sm px-2">No messages yet</div>}
    </div>
  );
}
