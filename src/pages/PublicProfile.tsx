import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import OverviewCard from "@/components/cards/OverviewCard";

/* ---------- API base helper ---------- */
const RAW = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
const BASE = (RAW ?? "").replace(/\/$/, "");
const api = (p: string) => (BASE ? `${BASE}${p.startsWith("/") ? "" : "/"}${p}` : (p.startsWith("/") ? p : `/${p}`));

type Card = {
  _id: string;
  owner: string;
  title: string;
  slug: string;
  theme: string;
  data: any;
  tagline?: string;
  website?: string;
  previewUrl?: string;
};
type Analytics = { views: number; clicks: number; shares: number; saves: number };

export default function PublicProfile() {
  const { ownerId } = useParams();
  const [owner, setOwner] = useState<{ _id: string; name: string } | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Card | null>(null);

  const [ownerView, setOwnerView] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics>({ views: 0, clicks: 0, shares: 0, saves: 0 });

  const token = useMemo(() => localStorage.getItem("token") || "", []);
  const authHeader: HeadersInit = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}) as HeadersInit,
    [token]
  );

  useEffect(() => {
    if (!ownerId) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(api(`/api/public/profile/${ownerId}/cards`));
        const ct = res.headers.get("content-type") || "";
        const data = ct.includes("application/json") ? await res.json() : {};
        if (!res.ok) throw new Error((data as any)?.message || `Error ${res.status}`);
        setCards((data as any)?.results || []);
        setOwner((data as any)?.owner || null);
      } catch (e: any) {
        setError(e?.message || "Failed to load cards");
      } finally {
        setLoading(false);
      }
    })();
  }, [ownerId]);

  async function openModal(card: Card) {
    setActive(card);
    setOpen(true);

    // record view (public)
    fetch(api(`/api/analytics/card/${card._id}/increment`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "view" }),
    }).catch(() => {});

    // owner-only analytics
    try {
      const res = await fetch(api(`/api/analytics/card/${card._id}`), { headers: authHeader });
      if (!res.ok) throw new Error("Not owner");
      const j = await res.json();
      setAnalytics(j?.analytics || { views: 0, clicks: 0, shares: 0, saves: 0 });
      setOwnerView(true);
    } catch {
      setOwnerView(false);
    }
  }

  async function inc(cardId: string, event: "click" | "share" | "save") {
    fetch(api(`/api/analytics/card/${cardId}/increment`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event }),
    }).catch(() => {});
    if (ownerView) {
      try {
        const res = await fetch(api(`/api/analytics/card/${cardId}`), { headers: authHeader });
        const j = await res.json();
        if (j?.analytics) setAnalytics(j.analytics);
      } catch {}
    }
  }

  function share() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).catch(() => {});
    if (active) inc(active._id, "share");
  }

  function mapData(d: any) {
    return {
      logo: d.logo,
      name: d.name || d.title,
      tagline: d.tagline || d.role || d.subtitle,
      phone: d.phone,
      email: d.email,
      website: d.website || d.site || d.url,
      badge: d.badge || d.category,
      location: d.location || d.country,
    };
  }

  return (
    <>
      <Navbar />
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-amber-700" />
          <div>
            <h1 className="text-2xl font-bold">{owner?.name || "Public Profile"}</h1>
            <p className="text-sm text-gray-400">All public cards by this user</p>
          </div>
        </div>

        {loading && <p className="text-sm text-gray-400">Loading…</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {cards.map((c) => (
            <button
              key={c._id}
              onClick={() => openModal(c)}
              className="rounded-2xl border border-[#2b2f36] bg-[#14181d] hover:bg-[#171c22] transition p-4 text-left"
            >
              <div className="relative w-full aspect-[16/10] rounded-xl bg-[#0f1317] border border-[#2b2f36] flex items-center justify-center overflow-hidden">
                <div className="scale-[0.7] sm:scale-[0.8] md:scale-[0.85] origin-top">
                  <OverviewCard data={mapData(c.data || {})} theme={c.theme} />
                </div>
              </div>
              <h3 className="font-semibold mt-3">{c.title}</h3>
              {c.data?.tagline && <p className="text-xs text-gray-400 line-clamp-1">{c.data.tagline}</p>}
            </button>
          ))}
        </div>
      </section>

      {open && active && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div
            className="bg-[#12161b] rounded-2xl border border-[#2b2f36] w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0e1216] min-h-[360px] flex items-center justify-center">
              <OverviewCard data={mapData(active.data || {})} theme={active.theme} />
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{active.title}</h3>
                <button className="text-gray-400 hover:text-white" onClick={() => setOpen(false)}>✕</button>
              </div>
              {active.data?.tagline && <p className="text-sm text-gray-400 mt-1">{active.data.tagline}</p>}

              {ownerView && (
                <>
                  <div className="mt-4 grid grid-cols-4 gap-3 text-center">
                    <div className="rounded-xl bg-[#161b21] border border-[#2b2f36] p-3">
                      <div className="text-xl font-bold">{analytics.views}</div>
                      <div className="text-xs text-gray-400">Views</div>
                    </div>
                    <div className="rounded-xl bg-[#161b21] border border-[#2b2f36] p-3">
                      <div className="text-xl font-bold">{analytics.clicks}</div>
                      <div className="text-xs text-gray-400">Clicks</div>
                    </div>
                    <div className="rounded-xl bg-[#161b21] border border-[#2b2f36] p-3">
                      <div className="text-xl font-bold">{analytics.shares}</div>
                      <div className="text-xs text-gray-400">Shares</div>
                    </div>
                    <div className="rounded-xl bg-[#161b21] border border-[#2b2f36] p-3">
                      <div className="text-xl font-bold">{analytics.saves}</div>
                      <div className="text-xs text-gray-400">Saves</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Analytics are visible only to the card owner.</p>
                </>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                {!ownerView && (
                  <button onClick={share} className="rounded-xl border border-[#2b2f36] px-4 py-2">
                    Share
                  </button>
                )}
                {ownerView && (
                  <>
                    <a
                      href={
                        (active.data?.website &&
                          (active.data.website.startsWith("http") ? active.data.website : `https://${active.data.website}`)) || "#"
                      }
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => inc(active._id, "click")}
                      className="rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 font-medium"
                    >
                      Open Card
                    </a>
                    <button onClick={share} className="rounded-xl border border-[#2b2f36] px-4 py-2">
                      Share
                    </button>
                    <button onClick={() => inc(active._id, "save")} className="rounded-xl border border-[#2b2f36] px-4 py-2">
                      Save
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
