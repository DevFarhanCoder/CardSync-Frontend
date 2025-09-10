import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type PublicUser = {
  id: string;
  name: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string | null;
};

export default function UserView() {
  const { id } = useParams();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setUser(data);
      } catch (e: any) {
        setErr(e?.message || "Failed to load user");
      }
    })();
  }, [id]);

  return (
    <div className="mx-auto max-w-xl p-4 text-neutral-100">
      {err && <div className="mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{err}</div>}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-neutral-800 grid place-items-center overflow-hidden">
          {user?.avatarUrl ? <img src={user.avatarUrl} className="h-16 w-16 object-cover" /> : "👤"}
        </div>
        <div>
          <div className="text-lg font-semibold">{user?.name || "User"}</div>
          {!!user?.phone && <div className="text-sm text-neutral-400">{user.phone}</div>}
        </div>
      </div>
      {!!user?.bio && <div className="mt-4 whitespace-pre-wrap text-neutral-300">{user.bio}</div>}
    </div>
  );
}
