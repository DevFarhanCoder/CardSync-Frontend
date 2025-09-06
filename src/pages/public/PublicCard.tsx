import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getJson } from "@/lib/api";

export default function PublicCard() {
  const { username, cardSlug } = useParams<{ username: string; cardSlug: string }>();
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const p = await getJson(`/api/public/profile/${username}`);
        const c = await getJson(`/api/public/card/${username}/${cardSlug}`);
        if (!alive) return;
        setProfile(p);
        setCard(c.card);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [username, cardSlug]);

  if (loading) return <div className="p-10 text-center">Loading…</div>;
  if (!card) return <div className="p-10 text-center">Card not found</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Background: user's other cards */}
      <div className="max-w-5xl mx-auto p-6 opacity-60">
        <h1 className="text-xl mb-4">{profile?.user?.name || profile?.user?.handle}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(profile?.cards || []).map((k:any) => (
            <a key={k.id} href={`/${profile.user.handle}/${k.slug}`} className="block p-4 rounded-xl bg-neutral-800">
              <div className="font-semibold">{k.title}</div>
              <div className="text-xs opacity-70">{k.visibility}</div>
            </a>
          ))}
        </div>
      </div>

      {/* Foreground: focused card */}
      <div className="fixed inset-0 grid place-items-center pointer-events-none">
        <div className="pointer-events-auto w-[min(92vw,520px)] rounded-2xl bg-neutral-900 border border-neutral-700 p-6 shadow-2xl">
          <div className="text-lg font-bold mb-2">{card.title}</div>
          {/* Render your card fields nicely here */}
          {/* ... */}
        </div>
      </div>
    </div>
  );
}
