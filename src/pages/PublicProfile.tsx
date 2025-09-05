import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getJson } from "@/lib/api";
import CardPreview from "@/components/CardPreview";
import Avatar from "@/components/ui/Avatar";

type Card = { id: string; data: any; createdAt: string };
type User = { id: string; name: string; email: string; phone?: string };

export default function PublicProfile() {
  const { owner } = useParams();
  const [sp, setSp] = useSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [viewer, setViewer] = useState<Card | null>(null);
  const cardParam = sp.get("card");

  useEffect(() => {
    let mounted = true;
    async function run() {
      const [u, c] = await Promise.all([
        getJson(`/api/public/user/${owner}`).catch(() => ({ user: { id: owner!, name: "", email: "" } })),
        getJson(`/api/public/profile/${owner}/cards`),
      ]);
      if (!mounted) return;
      setUser(u.user);
      const list: Card[] = (c.cards || []).map((x: any) => ({ ...x, createdAt: x.createdAt }));
      setCards(list);

      // open viewer if ?card= present
      if (cardParam) {
        const found = list.find((x) => x.id === cardParam);
        if (found) setViewer(found);
        else {
          const single = await getJson(`/api/public/card/${cardParam}`).catch(() => null);
          if (single?.card) setViewer({ id: single.card.id, data: single.card.data, createdAt: single.card.createdAt });
        }
      }
    }
    run();
    return () => { mounted = false; };
  }, [owner, cardParam]);

  const title = useMemo(
    () => user?.name || user?.email || "User",
    [user?.name, user?.email]
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-[var(--border)] p-4 flex items-center gap-4 bg-[#12161b]">
        <Avatar name={title} />
        <div>
          <div className="text-lg font-semibold">{title}</div>
          <div className="text-sm text-[var(--subtle)]">
            {[user?.email, user?.phone].filter(Boolean).join(" • ") || "—"}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c) => (
          <button
            key={c.id}
            className="card p-4 text-left"
            onClick={() => {
              setViewer(c);
              sp.set("card", c.id); setSp(sp, { replace: true });
            }}
          >
            <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)] grid place-items-center overflow-hidden">
              <CardPreview id={`pub-${c.id}`} data={c.data} />
            </div>
            <div className="mt-2 text-xs text-[var(--subtle)]">{new Date(c.createdAt).toLocaleString()}</div>
          </button>
        ))}
        {!cards.length && <div className="text-[var(--subtle)]">No public cards yet.</div>}
      </div>

      {/* Viewer-only modal (no actions) */}
      {viewer && (
        <div className="fixed inset-0 z-[80]">
          <div
            className="absolute inset-0 bg-black/90"
            onClick={() => {
              setViewer(null);
              sp.delete("card"); setSp(sp, { replace: true });
            }}
          />
          <div className="absolute inset-0 grid place-items-center p-4">
            <div className="w-full max-w-4xl rounded-2xl border border-[var(--border)] bg-[#12161b] p-6 relative">
              <button
                className="chip absolute right-4 top-4"
                onClick={() => {
                  setViewer(null);
                  sp.delete("card"); setSp(sp, { replace: true });
                }}
              >
                ✕
              </button>
              <div className="grid md:grid-cols-[1fr,320px] gap-6">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)] grid place-items-center overflow-hidden">
                  <CardPreview id={`view-${viewer.id}`} data={viewer.data} />
                </div>
                <div className="space-y-3">
                  <div className="font-semibold">Card</div>
                  <div className="text-sm text-[var(--subtle)]">
                    {new Date(viewer.createdAt).toLocaleString()}
                  </div>
                  {/* no buttons for viewers */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
