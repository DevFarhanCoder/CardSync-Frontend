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
  const localToken = localStorage.getItem("token") || "";
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    if (!localToken) {
      setNeedsLogin(true);
      setLoading(false);
      return;
    }
  }, [] as any);


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
  
  if (needsLogin) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    return (
      <div className="max-w-xl mx-auto p-6">
        <div className="rounded-xl border border-[var(--border)] p-6 bg-[var(--card)]">
          <h2 className="text-lg font-semibold mb-2">Sign in required</h2>
          <p className="text-[var(--subtle)] mb-4">You need an account to view this shared card.</p>
          <a href={`/signin?next=${next}`} className="inline-block rounded-lg bg-yellow-400 text-black px-4 py-2 font-medium">Sign in</a>
        </div>
      </div>
    );
  }

  return () => { alive = false; };
  }, [id, token]);


  // record a public "view" when someone opens the shared card page
  useEffect(() => {
    if (!card?._id) return;
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analytics/card/${card._id}/increment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "view" }),
    }).catch(() => { });
  }, [card?._id]);


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


  if (needsLogin) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    return (
      <div className="max-w-xl mx-auto p-6">
        <div className="rounded-xl border border-[var(--border)] p-6 bg-[var(--card)]">
          <h2 className="text-lg font-semibold mb-2">Sign in required</h2>
          <p className="text-[var(--subtle)] mb-4">You need an account to view this shared card.</p>
          <a href={`/signin?next=${next}`} className="inline-block rounded-lg bg-yellow-400 text-black px-4 py-2 font-medium">Sign in</a>
        </div>
      </div>
    );
  }

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
