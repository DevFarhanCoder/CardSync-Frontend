// src/pages/Explore.tsx
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import CardPreview from "@/components/CardPreview";

// Use Vite env (typed loosely to avoid TS complaints if vite-env.d.ts isn't set up yet)
const API_BASE: string =
  (import.meta as any)?.env?.VITE_API_BASE_URL || "http://localhost:8080";

type PublicCard = {
  _id: string;
  title: string;
  type: "business" | "personal" | "portfolio" | "event";
  theme: "luxe" | "minimal" | "tech";
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  website?: string;
  tagline?: string;
  role?: string;
  eventDate?: string;
  eventVenue?: string;
  socials?: Record<string, string>;
  keywords?: string[];
};

function tokenize(q: string) {
  return q.toLowerCase().trim().split(/\s+/).filter(Boolean).slice(0, 10);
}

export default function Explore() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<PublicCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Trigger search when query changes (with debounce)
  useEffect(() => {
    let alive = true;
    const terms = tokenize(q);

    // If empty, clear results and stop
    if (terms.length === 0) {
      setResults([]);
      setErr(null);
      setLoading(false);
      return;
    }

    const run = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(
          `${API_BASE}/api/cards/search?q=${encodeURIComponent(terms.join(" "))}`
        );
        const json = await res.json();
        if (!alive) return;

        if (res.ok) {
          setResults(Array.isArray(json.items) ? json.items : []);
        } else {
          setResults([]);
          setErr(json?.message || "Search failed");
        }
      } catch (e: any) {
        if (!alive) return;
        setResults([]);
        setErr(e?.message || "Network error");
      } finally {
        if (alive) setLoading(false);
      }
    };

    const t = setTimeout(run, 250); // debounce 250ms
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q]);

  const subtitle = useMemo(() => {
    if (loading) return "Searching…";
    if (err) return err;
    if (!q.trim()) return "Search public profiles and connect instantly.";
    if (results.length === 0) return "No results yet. Try a broader keyword.";
    return `Found ${results.length} result${results.length > 1 ? "s" : ""}.`;
  }, [q, loading, err, results]);

  return (
    <>
      <Navbar />

      {/* Hero / Search */}
      <section className="relative border-b border-[var(--border)] bg-[rgba(15,18,22,.72)]">
        <div className="container py-10">
          <div className="max-w-3xl">
            <div className="chip mb-3">Discover</div>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              Find people by <span className="text-[var(--gold)]">name</span> or{" "}
              <span className="text-[var(--gold)]">keywords</span>.
            </h1>
            <p className="text-[var(--subtle)] mt-3">{subtitle}</p>

            <div className="mt-5 flex gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name or keyword…"
                className="flex-1 rounded-xl bg-[var(--muted)] border border-[var(--border)] px-4 py-3 text-base text-[var(--text)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="container py-8">
        {loading ? (
          <div className="card p-6 text-[var(--subtle)]">Loading…</div>
        ) : err ? (
          <div className="card p-6 text-red-400">{err}</div>
        ) : !q.trim() ? (
          <div className="card p-6 text-[var(--subtle)]">
            Start typing to search public profiles.
          </div>
        ) : results.length === 0 ? (
          <div className="card p-6 text-[var(--subtle)]">
            No results yet. Try a broader keyword.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((r) => {
              const previewData = {
                title: r.title,
                type: r.type,
                theme: r.theme,
                name: r.name,
                email: r.email,
                phone: r.phone,
                address: r.address,
                logoUrl: r.logoUrl,
                website: r.website,
                tagline: r.tagline,
                role: r.role,
                eventDate: r.eventDate,
                eventVenue: r.eventVenue,
                socials: r.socials || {},
              };
              return (
                <div key={r._id} className="card p-4 hover:bg-white/5 transition">
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)] grid place-items-center h-44 overflow-hidden">
                    <CardPreview data={previewData} showPlaceholders={false} />
                  </div>
                  <div className="mt-3">
                    <div className="font-semibold truncate">
                      {r.name || r.title || "Card"}
                    </div>
                    <div className="text-xs text-[var(--subtle)] truncate">
                      {(r.keywords || []).slice(0, 6).join(", ")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
