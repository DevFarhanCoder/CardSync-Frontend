import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Eye, X } from "lucide-react";
import CardPreview from "@/components/CardPreview";
import ShareButton from "@/components/ShareButton";
import { api } from "@/lib/api";

type Saved = { id: string; dbId?: string | null; createdAt: string; data: any };

export default function MyCards() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState<Saved[]>([]);
  const [active, setActive] = useState<Saved | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const raw = localStorage.getItem("cards");
    setSaved(raw ? JSON.parse(raw) : []);
  }, []);

  const hasCards = useMemo(() => saved.length > 0, [saved]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleEdit = (c: Saved) => {
    navigate(`/dashboard/builder?id=${c.id}`, { state: { id: c.id, data: c.data } });
  };

  const handleDelete = async (c: Saved) => {
    if (!confirm("Are you sure you want to delete this card?")) return;
    try {
      if (c.dbId) {
        const res = await fetch(api(`/cards/${c.dbId}`), {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || j?.message || "Failed to delete on server");
        }
      }
      setSaved((prev) => {
        const next = prev.filter((x) => x.id !== c.id);
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {saved.map((c) => (
            <div key={c.id} className="card p-4 relative group">
              <button
                className="absolute right-3 top-3 h-8 w-8 grid place-items-center rounded-xl border border-[var(--border)] bg-[var(--muted)]/80 hover:bg-white/10"
                title="Quick view"
                onClick={() => setActive(c)}
              >
                <Eye size={16} />
              </button>

              {/* Preview Card */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)] grid place-items-center overflow-hidden">
                <CardPreview id={`card-${c.id}`} data={c.data} />
              </div>

              {/* Card Metadata */}
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold truncate">{c.data?.title || c.data?.type || "Card"}</h4>
                  <p className="text-xs text-[var(--subtle)]">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="chip">{c.dbId ? "Synced" : "Local"}</span>
              </div>

              {/* Actions (only this row kept) */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <ShareButton targetId={`card-${c.id}`} data={c.data} />
                <button className="btn btn-gold" onClick={() => handleEdit(c)}>Edit</button>
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
              <button className="absolute right-4 top-4 chip" onClick={() => setActive(null)}>
                <X size={16} />
              </button>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 grid place-items-center">
                  <CardPreview id="preview-active" data={active.data} />
                </div>
                <div className="w-full md:w-64 space-y-3">
                  <div className="font-semibold">{active.data?.title || "Card"}</div>
                  <div className="text-sm text-[var(--subtle)]">
                    {new Date(active.createdAt).toLocaleString()}
                  </div>
                  <ShareButton targetId="preview-active" data={active.data} />
                  <button className="btn w-full" onClick={() => handleEdit(active)}>Edit</button>
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
