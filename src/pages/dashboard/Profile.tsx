import React, { useEffect, useState } from "react";
import { fetchMe, updateMe, uploadAvatar } from "@/lib/userApi";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const nav = useNavigate();
  const [me, setMe] = useState<{ id: string; name: string; email: string; phone: string; bio: string; avatarUrl: string | null } | null>(null);
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false); const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null); const [err, setErr] = useState<string | null>(null);

  useEffect(() => { (async () => {
    try { const data = await fetchMe(); setMe(data); setName(data.name); setPhone(data.phone || ""); setBio(data.bio || ""); }
    catch (e:any) { setErr(e?.message || "Failed to load profile"); }
  })(); }, []);

  async function save() {
    setSaving(true); setErr(null); setMsg(null);
    try { await updateMe({ name, phone, bio }); setMsg("Saved! Redirecting…"); setTimeout(()=>nav("/dashboard/cards"), 600); }
    catch (e:any) { setErr(e?.message || "Failed to save"); }
    finally { setSaving(false); }
  }

  async function changeAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true); setErr(null); setMsg(null);
    try { await uploadAvatar(file); const data = await fetchMe(); setMe(data); setMsg("Avatar updated"); }
    catch (e:any) { setErr(e?.message || "Failed to upload avatar"); }
    finally { setUploading(false); }
  }

  return (
    <div className="mx-auto max-w-2xl p-4 text-neutral-100">
      <h1 className="mb-4 text-lg font-semibold">My Profile</h1>

      {err && <div className="mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{err}</div>}
      {msg && <div className="mb-3 rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-300">{msg}</div>}

      <div className="mb-4 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-neutral-800 grid place-items-center overflow-hidden">
          {me?.avatarUrl ? <img src={me.avatarUrl} className="h-16 w-16 object-cover" /> : "👤"}
        </div>
        <label className="cursor-pointer rounded-lg bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700">
          <input type="file" accept="image/*" className="hidden" onChange={changeAvatar} disabled={uploading} />
          {uploading ? "Uploading…" : "Change avatar"}
        </label>
      </div>

      <div className="grid gap-2">
        <label className="text-xs text-neutral-400">Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} className="rounded-lg bg-neutral-800 px-3 py-2" />
        <label className="text-xs text-neutral-400">Phone</label>
        <input value={phone} onChange={e=>setPhone(e.target.value)} className="rounded-lg bg-neutral-800 px-3 py-2" placeholder="+91…" />
        <label className="text-xs text-neutral-400">About</label>
        <textarea value={bio} onChange={e=>setBio(e.target.value)} className="rounded-lg bg-neutral-800 px-3 py-2 min-h-[96px]" />
        <button onClick={save} className="mt-2 w-max rounded-lg bg-yellow-400 px-4 py-2 text-black text-sm disabled:opacity-50" disabled={saving}>{saving?"Saving…":"Save changes"}</button>
      </div>
    </div>
  );
}
