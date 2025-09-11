// src/pages/dashboard/Profile.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, updateMe, uploadAvatar, type Me } from "@/lib/userApi";

export default function Profile() {
  const nav = useNavigate();
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [about, setAbout] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const m = await getMe();
        setMe(m);
        setName(m.name || "");
        setPhone(m.phone || "");
        setAbout(m.about || "");
      } catch (e: any) {
        setErr(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSave() {
    setSaving(true);
    setErr(null);
    try {
      const m = await updateMe({ name, phone, about });
      setMe(m);
      // redirect to My Cards
      nav("/dashboard/cards");
    } catch (e: any) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onPickAvatar(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    if (!f) return;
    setErr(null);
    try {
      const { url } = await uploadAvatar(f);
      setMe(prev => prev ? { ...prev, avatarUrl: url } : prev);
    } catch (e: any) {
      setErr(e?.message || "Avatar upload failed");
    } finally {
      ev.target.value = "";
    }
  }

  if (loading) return <div className="p-4 text-sm text-neutral-400">Loading…</div>;

  return (
    <div className="max-w-xl p-4">
      {err && <div className="mb-3 rounded bg-red-900/30 text-red-300 px-3 py-2 text-sm">{err}</div>}

      <div className="flex items-center gap-3 mb-4">
        <img
          src={me?.avatarUrl || "/avatar.svg"}
          alt=""
          className="w-10 h-10 rounded-full bg-neutral-700 object-cover"
        />
        <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer">
          <input type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
          <span className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700">Change avatar</span>
        </label>
      </div>

      <input
        className="w-full mb-3 px-3 py-2 rounded bg-neutral-900 border border-neutral-800"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <input
        className="w-full mb-3 px-3 py-2 rounded bg-neutral-900 border border-neutral-800"
        placeholder="+91…"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />
      <textarea
        className="w-full mb-4 px-3 py-2 h-28 rounded bg-neutral-900 border border-neutral-800"
        placeholder="About"
        value={about}
        onChange={e => setAbout(e.target.value)}
      />

      <button
        onClick={onSave}
        disabled={saving}
        className="px-4 py-2 rounded bg-yellow-600 text-black disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
