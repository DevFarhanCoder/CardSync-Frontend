import React, { useEffect, useState } from "react";
import { fetchMe, updateMe, uploadAvatar } from "@/lib/userApi";

export default function ProfilePage() {
  const [me, setMe] = useState<{ id: string; name: string; email: string; phone: string; bio: string; avatarUrl: string | null } | null>(null);
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false); const [uploading, setUploading] = useState(false);

  useEffect(() => { (async () => {
    const data = await fetchMe(); setMe(data); setName(data.name); setPhone(data.phone || ""); setBio(data.bio || "");
  })(); }, []);

  async function save() {
    setSaving(true);
    try { await updateMe({ name, phone, bio }); const data = await fetchMe(); setMe(data); } finally { setSaving(false); }
  }

  async function changeAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { await uploadAvatar(file); const data = await fetchMe(); setMe(data); } finally { setUploading(false); }
  }

  return (
    <div className="mx-auto max-w-2xl p-4 text-neutral-100">
      <h1 className="mb-4 text-lg font-semibold">My Profile</h1>

      <div className="mb-4 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-neutral-800 grid place-items-center">{me?.avatarUrl ? <img src={me.avatarUrl} className="h-16 w-16 rounded-full object-cover" /> : "👤"}</div>
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
