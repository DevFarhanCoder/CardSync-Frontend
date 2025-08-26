// src/pages/dashboard/MyCards.tsx
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Eye, Link2, Copy, ExternalLink, X } from "lucide-react";
import CardPreview from "@/components/CardPreview";

type Saved = { id: string; dbId?: string | null; createdAt: string; data: any };
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function MyCards() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState<Saved[]>([]);
  const [active, setActive] = useState<Saved | null>(null);

  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const raw = localStorage.getItem("cards");
    setSaved(raw ? JSON.parse(raw) : []);
  }, []);

  const hasCards = useMemo(() => saved.length > 0, [saved]);

  const localShareUrl = (localId: string) => `${location.origin}/share/${localId}`;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  // Share (use POST /api/cards/:id/share)
  const handleShare = async (c: Saved) => {
    let url = localShareUrl(c.id);

    if (c.dbId) {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/api/cards/${c.dbId}/share`, {
          method: "POST",
          headers,
        });
        const data = await res.json();
        if (res.ok && data?.shareUrl) url = data.shareUrl;
      } catch {
        /* fall back to local link */
      }
    }

    setShareUrl(url);
    setShareOpen(true);
  };

  const copyShare = async () => {
    await navigator.clipboard.writeText(shareUrl);
    showToast("Link Copied");
  };

  const handleEdit = (c: Saved) => {
    navigate(`/dashboard/builder?id=${c.id}`, { state: { id: c.id, data: c.data } });
  };

  // NEW — delete handler (backend if dbId exists, always update local)
  // Delete (use DELETE /api/cards/:id)
  const handleDelete = async (c: Saved) => {
    if (!confirm("Are you sure you want to delete this card?")) return;

    try {
      if (c.dbId) {
        const res = await fetch(`${API_BASE}/api/cards/${c.dbId}`, {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || j?.message || "Failed to delete on server");
        }
      }

      // remove from localStorage + state
      setSaved(prev => {
        const next = prev.filter(x => x.id !== c.id);
        localStorage.setItem("cards", JSON.stringify(next));
        return next;
      });
      showToast("Card deleted");
    } catch (e: any) {
      showToast(e.message || "Delete failed");
    }
  };


  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">My Cards</h2>
        <Link to="/dashboard/builder" className="btn btn-gold">Create New</Link>
      </div>

      {!hasCards ? (
        <div className="card p-5 text-[var(--subtle)]">No saved cards yet.</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {saved.map((c) => (
            <div key={c.id} className="card p-4 relative group">
              <button
                className="absolute right-3 top-3 h-9 w-9 grid place-items-center rounded-xl border border-[var(--border)] bg-[var(--muted)]/80 hover:bg-white/10"
                title="Quick view"
                onClick={() => setActive(c)}
              >
                <Eye size={18} />
              </button>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)] grid place-items-center h-44 overflow-hidden">
                <CardPreview data={c.data} showPlaceholders={false} />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold truncate">
                    {c.data?.title || c.data?.type || "Card"}
                  </h4>
                  <p className="text-xs text-[var(--subtle)]">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="chip">{c.dbId ? "Synced" : "Local"}</span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <button className="btn btn-outline" onClick={() => handleShare(c)}>
                  <Link2 className="mr-2 h-4 w-4" /> Share
                </button>
                <button className="btn btn-gold" onClick={() => handleEdit(c)}>
                  Edit
                </button>
                {/* NEW — Delete */}
                <button
                  className="btn bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => handleDelete(c)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick view modal */}
      {active && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setActive(null)} />
          <div className="absolute inset-0 grid place-items-center p-4">
            <div className="w-full max-w-3xl card p-6 relative">
              <button className="absolute right-4 top-4 chip" onClick={() => setActive(null)}>Close</button>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 grid place-items-center">
                  <CardPreview data={active.data} showPlaceholders={false} />
                </div>
                <div className="w-full md:w-64 space-y-3">
                  <div className="font-semibold">{active.data?.title || "Card"}</div>
                  <div className="text-sm text-[var(--subtle)]">{new Date(active.createdAt).toLocaleString()}</div>
                  <button className="btn btn-gold w-full" onClick={() => handleShare(active)}>
                    <Link2 className="mr-2 h-4 w-4" /> Share
                  </button>
                  <button className="btn w-full" onClick={() => handleEdit(active)}>Edit</button>
                  {/* Delete from modal too (optional) */}
                  <button
                    className="btn bg-red-600 hover:bg-red-700 text-white w-full"
                    onClick={() => handleDelete(active)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share modal */}
      {shareOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShareOpen(false)} />
          <div className="absolute inset-0 grid place-items-center p-4">
            <div className="w-full max-w-lg card p-6 relative">
              <button className="absolute right-4 top-4 chip" onClick={() => setShareOpen(false)}><X size={16} /></button>
              <h3 className="text-xl font-semibold mb-2">Share your card</h3>
              <p className="text-sm text-[var(--subtle)] mb-4">Anyone with this link can view the card.</p>
              <div className="flex items-center gap-2">
                <input className="flex-1 input bg-[var(--muted)] text-[var(--text)]" value={shareUrl} readOnly onFocus={(e) => e.currentTarget.select()} />
                <button className="btn btn-outline" onClick={copyShare}><Copy className="mr-2 h-4 w-4" />Copy</button>
                <a className="btn" href={shareUrl} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Open</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[70]">
          <div className="bg-black/90 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
