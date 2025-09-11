import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, updateMe, uploadAvatar, type Me } from "@/lib/userApi";

export default function Profile() {
  const nav = useNavigate();
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [about, setAbout] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const m = await getMe();
        setMe(m);
        setName(m.name || "");
        setPhone(m.phone || "");
        setAbout(m.about || "");
        setError(null);
      } catch (e: any) {
        setError(String(e?.message || e));
      }
    })();
  }, []);

  async function onChangeAvatar(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await uploadAvatar(file);
      setMe(m => (m ? { ...m, avatarUrl: url } : m));
      setError(null);
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  async function onSave() {
    setSaving(true);
    try {
      const m = await updateMe({ name, phone, about });
      setMe(m);
      setError(null);
      // redirect after successful save
      nav("/dashboard/cards");
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      {error && (
        <div className="mb-3 rounded bg-red-900/30 border border-red-800 text-red-200 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <img
          src={me?.avatarUrl || "/avatar.svg"}
          className="w-12 h-12 rounded-full bg-neutral-700 object-cover"
          alt=""
        />
        <label className="px-3 py-1 rounded bg-neutral-800 border border-neutral-700 cursor-pointer text-sm">
          Change avatar
          <input type="file" className="hidden" accept="image/*" onChange={onChangeAvatar} />
        </label>
      </div>

      <div className="space-y-3">
        <input className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2"
               placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2"
               placeholder="+91..." value={phone} onChange={e => setPhone(e.target.value)} />
        <textarea className="w-full h-28 bg-neutral-900 border border-neutral-700 rounded px-3 py-2"
                  placeholder="About" value={about} onChange={e => setAbout(e.target.value)} />
        <button disabled={saving}
                onClick={onSave}
                className="px-4 py-2 rounded bg-yellow-500 text-black disabled:opacity-50">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
