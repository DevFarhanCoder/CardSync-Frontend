// src/pages/Share.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import CardPreview from "@/components/CardPreview";
// Reuse your centralized API helper (already used elsewhere in the app)
import { getJson } from "@/lib/api";

type Card = Record<string, any>;

export default function Share() {
  const { id } = useParams<{ id: string }>();
  const [sp] = useSearchParams();

  // Optional share token (e.g., magic link or temporary access)
  const token = sp.get("token") || "";

  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // If your app requires auth for viewing cards, we can hint the user to sign in
  const hasLocalToken = useMemo(() => !!localStorage.getItem("token"), []);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      try {
        setLoading(true);
        setErr(null);

        if (!id) {
          throw new Error("Invalid or missing card id.");
        }

        // Use your shared API helper so base URL is always correct
        // (In prod, Vercel will proxy /api → Render; in dev, Vite proxy handles it.)
        const data = await getJson(`/api/cards/${encodeURIComponent(id)}${token ? `?token=${encodeURIComponent(token)}` : ""}`);
        if (!isMounted) return;

        // Adjust to your API’s actual shape; assuming { card: {...} }
        setCard(data?.card ?? null);
        if (!data?.card) {
          setErr("Card not found or you don't have permission to view it.");
        }
      } catch (e: any) {
        if (!isMounted) return;
        setErr(e?.message || "Failed to load the shared card.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    run();
    return () => {
      isMounted = false;
    };
  }, [id, token]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <h1 className="text-2xl font-semibold">Share</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {err}
        </div>

        {!hasLocalToken && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-amber-800">
              If this link requires an account, please{" "}
              <Link to="/signin" className="underline">
                sign in
              </Link>{" "}
              and try again.
            </p>
          </div>
        )}

        <div>
          <Link to="/" className="inline-flex items-center rounded-lg border px-4 py-2 hover:bg-gray-50">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <h1 className="text-2xl font-semibold">Share</h1>
        <p className="text-gray-600">No card to display.</p>
        <Link to="/" className="inline-flex items-center rounded-lg border px-4 py-2 hover:bg-gray-50">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Shared Card</h1>
        <Link to="/" className="inline-flex items-center rounded-lg border px-4 py-2 hover:bg-gray-50">
          ← Back to Home
        </Link>
      </div>

      {/* Render your existing preview component */}
      <CardPreview card={card} />

      {/* Optional: show minimal meta */}
      {card?.title && (
        <div className="text-sm text-gray-500">
          <span className="font-medium">Title:</span> {card.title}
        </div>
      )}
    </div>
  );
}
