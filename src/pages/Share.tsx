// src/pages/Share.tsx
import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import CardPreview from "@/components/CardPreview";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Share() {
  const { id } = useParams<{ id: string }>();
  const [sp] = useSearchParams();
  const token = sp.get("token") || "";
  const [card, setCard] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/cards/${id}${token ? `?token=${token}` : ""}`);
        const json = await res.json();
        if (!alive) return;
        if (res.ok) setCard(json.card);
        else setErr(json?.message || "Unable to load card");
      } catch (e: any) {
        if (alive) setErr(e.message || "Network error");
      } finally {
        if (alive) setLoading(false);
      }
    };
    run();
    return () => { alive = false; };
  }, [id, token]);

  if (loading) return <div className="max-w-3xl mx-auto p-6 text-[var(--subtle)]">Loading…</div>;
  if (err) return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="card p-6">
        <div className="text-red-400 font-medium mb-2">Error</div>
        <div className="text-[var(--subtle)]">{err}</div>
        <div className="mt-4">
          <Link to="/signin" className="btn btn-gold">Sign in</Link>
        </div>
      </div>
    </div>
  );

  const data = card ? {
    title: card.title, type: card.type, theme: card.theme,
    name: card.name, email: card.email, phone: card.phone, address: card.address,
    logoUrl: card.logoUrl, website: card.website, tagline: card.tagline, role: card.role,
    eventDate: card.eventDate, eventVenue: card.eventVenue, socials: card.socials || {},
  } : null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">{card?.title || "Card"}</h2>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)] grid place-items-center h-[440px] overflow-hidden">
          {data && <CardPreview data={data} showPlaceholders={false} />}
        </div>
      </div>
    </div>
  );
}
