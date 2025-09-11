import { useEffect, useState } from "react";
import { getMe, updateMe, uploadAvatar, type Me } from "@/lib/userApi";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const nav = useNavigate();
  const [me, setMe] = useState<Me | null>(null);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getMe();
        setMe(data);
        setErr("");
      } catch (e: any) {
        setErr(e?.message || "Failed to load profile");
      }
    })();
  }, []);

  async function onSave() {
    if (!me) return;
    try {
      setErr("");
      const saved = await updateMe({
        name: me.name,
        phone: me.phone,
        about: me.about,
      });
      setMe(saved);
      // redirect to My Cards (change route if yours differs)
      nav("/dashboard/my-cards", { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Save failed");
    }
  }

  async function onPickAvatar(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      setErr("");
      const { url } = await uploadAvatar(file);
      setMe(v => (v ? { ...v, avatarUrl: url } : v));
    } catch (e: any) {
      setErr(e?.message || "Upload failed");
    } finally {
      ev.target.value = "";
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">My Profile</h1>

      {err && (
        <div className="mb-3 text-xs px-3 py-2 rounded bg-red-900/40 text-red-200">
          {err}
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <img
          src={me?.avatarUrl || "/avatar.svg"}
          className="w-14 h-14 rounded-full bg-neutral-700 object-cover"
          alt="avatar"
        />
        <label className="px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600 cursor-pointer text-sm">
          <input hidden type="file" accept="image/*" onChange={onPickAvatar} />
          Change avatar
        </label>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-xs mb-1">Name</div>
          <input
            className="w-full px-3 py-2 rounded bg-neutral-800 outline-none"
            value={me?.name || ""}
            onChange={e => setMe(v => (v ? { ...v, name: e.target.value } : v))}
          />
        </div>
        <div>
          <div className="text-xs mb-1">Phone</div>
          <input
            className="w-full px-3 py-2 rounded bg-neutral-800 outline-none"
            value={me?.phone || ""}
            onChange={e =>
              setMe(v => (v ? { ...v, phone: e.target.value } : v))
            }
            placeholder="+91…"
          />
        </div>
        <div>
          <div className="text-xs mb-1">About</div>
          <textarea
            className="w-full min-h-[120px] px-3 py-2 rounded bg-neutral-800 outline-none"
            value={me?.about || ""}
            onChange={e =>
              setMe(v => (v ? { ...v, about: e.target.value } : v))
            }
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={onSave}
          className="px-4 py-2 rounded bg-amber-500 text-black font-medium"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}
