import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function UserView() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // simple read-only fetch via existing /api/chat/groups/:id/members context is not ideal;
    // in a real app you'd have /api/users/:id. For now we'll call a tiny temp endpoint if you have it,
    // else show static shell.
    (async () => {
      try {
        const res = await fetch(`/api/users/${id}`, { headers: {} }); // optional: implement later
        if (res.ok) setUser(await res.json());
      } catch {}
    })();
  }, [id]);

  return (
    <div className="mx-auto max-w-xl p-4 text-neutral-100">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-neutral-800 grid place-items-center">{user?.avatarUrl ? <img src={user.avatarUrl} className="h-16 w-16 rounded-full object-cover" /> : "👤"}</div>
        <div>
          <div className="text-lg font-semibold">{user?.name || "User"}</div>
          <div className="text-sm text-neutral-400">{user?.phone || ""}</div>
        </div>
      </div>
      <div className="mt-4 whitespace-pre-wrap text-neutral-300">{user?.bio || ""}</div>
      {!user && <div className="text-sm text-neutral-400">Basic view. (Optional: add /api/users/:id to return public info.)</div>}
    </div>
  );
}
