import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import OverviewCard from "@/components/cards/OverviewCard";

const RAW_BASE = (import.meta as any)?.env?.VITE_API_BASE_URL || "";
const API_BASE = RAW_BASE.replace(/\/$/, "");
const api = (p: string) => `${API_BASE}${p.startsWith("/") ? "" : "/"}${p}`;

type ExploreCard = {
  _id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  slug: string;
  theme: string;
  data: any;
  previewUrl?: string | null;
  category: string;
  keywords?: string[];
  tags?: string[];
};

export default function Explore() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ExploreCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<ExploreCard | null>(null); // modal
  const navigate = useNavigate();

  // debounce search
  useEffect(() => {
    let t = setTimeout(() => {
      fetchData(query);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    fetchData("");
  }, []);

  async function fetchData(q: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(api(`/api/explore${q ? `?q=${encodeURIComponent(q)}` : ""}`));
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResults(data?.results || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    const s = new Set<string>();
    results.forEach((r) => r.category && s.add(r.category));
    return ["All", ...Array.from(s)];
  }, [results]);

  const [cat, setCat] = useState("All");
  const filtered = useMemo(
    () => (cat === "All" ? results : results.filter((r) => r.category?.toLowerCase() === cat.toLowerCase())),
    [results, cat]
  );

  return (
    <>
      <Navbar />
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold">
          Find people by <span className="text-white/90">name</span> or <span className="text-yellow-400">keywords</span>.
        </h1>

        {/* search bar */}
        <div className="mt-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search: software, designer, 'mumbai', etc."
            className="w-full rounded-2xl bg-[#12161b] border border-[#2b2f36] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {/* category chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                cat === c
                  ? "bg-yellow-500 text-black border-yellow-500"
                  : "bg-[#12161b] text-white/80 border-[#2b2f36] hover:bg-[#151b21]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* grid */}
        <div className="mt-6 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#2b2f36] bg-[#14181d] p-4 animate-pulse h-[220px]" />
          ))}

          {!loading && error && <p className="text-red-400">{error}</p>}

          {!loading && !error && filtered.map((card) => (
            <article
              key={card._id}
              className="rounded-2xl border border-[#2b2f36] bg-[#14181d] hover:bg-[#171c22] transition p-4"
            >
              {/* top row: owner + category */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate(`/u/${card.ownerId}`)}
                  className="flex items-center gap-3 group"
                  title={`View ${card.ownerName}'s profile`}
                >
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-amber-700 block" />
                  <span className="font-medium group-hover:underline">{card.ownerName}</span>
                </button>

                {card.category && (
                  <span className="text-xs px-2 py-1 rounded-full bg-indigo-600/25 text-indigo-200 border border-indigo-500/40">
                    {card.category}
                  </span>
                )}
              </div>

              {/* mini preview */}
              <div className="mt-3 rounded-xl border border-[#2b2f36] bg-[#0f1317] h-[130px] overflow-hidden flex items-center justify-center">
                <div className="scale-[0.7] origin-top">
                  <OverviewCard
                    data={{
                      logo: card.data?.logo,
                      name: card.data?.name || card.title,
                      tagline: card.data?.tagline || card.data?.role,
                      phone: card.data?.phone,
                      email: card.data?.email,
                      website: card.data?.website,
                      badge: card.data?.category || card.category,
                      location: card.data?.location,
                    }}
                    theme={card.theme}
                  />
                </div>
              </div>

              {/* bottom row: title + keywords + actions */}
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{card.title}</div>
                  <div className="mt-1 flex gap-1 flex-wrap">
                    {(card.keywords || card.tags || [])
                      .slice(0, 2)
                      .filter(Boolean)
                      .map((k, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70">
                          {k}
                        </span>
                      ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActive(card)}
                    className="px-3 py-1.5 rounded-xl text-sm border border-[#2b2f36] hover:bg-[#151b21]"
                    title="Preview"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/u/${card.ownerId}`).catch(() => {});
                    }}
                    className="px-3 py-1.5 rounded-xl text-sm border border-[#2b2f36] hover:bg-[#151b21]"
                    title="Share profile"
                  >
                    Share
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* simple preview modal */}
      {active && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setActive(null)}>
          <div
            className="bg-[#12161b] rounded-2xl border border-[#2b2f36] w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0e1216] min-h-[360px] flex items-center justify-center">
              <OverviewCard
                data={{
                  logo: active.data?.logo,
                  name: active.data?.name || active.title,
                  tagline: active.data?.tagline || active.data?.role,
                  phone: active.data?.phone,
                  email: active.data?.email,
                  website: active.data?.website,
                  badge: active.data?.category || active.category,
                  location: active.data?.location,
                }}
                theme={active.theme}
              />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">{active.title}</div>
                  <button
                    onClick={() => navigate(`/u/${active.ownerId}`)}
                    className="text-sm text-white/70 hover:underline"
                  >
                    by {active.ownerName}
                  </button>
                </div>
                <button className="text-gray-400 hover:text-white" onClick={() => setActive(null)}>✕</button>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => navigate(`/u/${active.ownerId}`)}
                  className="rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 font-medium"
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/u/${active.ownerId}`).catch(() => {});
                  }}
                  className="rounded-xl border border-[#2b2f36] px-4 py-2"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
