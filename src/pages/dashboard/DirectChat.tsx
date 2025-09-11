// src/pages/dashboard/DirectChat.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserPublic, type Me } from "@/lib/userApi";

// small relative time helper
function timeAgo(iso?: string | Date) {
  if (!iso) return "—";
  const t = typeof iso === "string" ? new Date(iso) : iso;
  const sec = Math.max(1, Math.floor((Date.now() - t.getTime()) / 1000));
  const steps: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [7, "d"],
    [4.345, "w"],
    [12, "mo"],
  ];
  let v = sec, u = "s";
  for (const [k, label] of steps) {
    if (v < k) { u = label; break; }
    v = Math.floor(v / k); u = label;
  }
  return `${v}${u} ago`;
}

export default function DirectChat() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const [user, setUser] = useState<Me | null>(null);

  useEffect(() => {
    (async () => {
      if (!partnerId) return;
      const data = await getUserPublic(partnerId);
      setUser(data);
    })();
  }, [partnerId]);

  return (
    <div className="flex flex-col h-full">
      {/* header: avatar + name + last active */}
      <div className="flex items-center gap-3 p-3 border-b border-neutral-800">
        <img
          src={user?.avatarUrl || "/avatar.svg"}
          alt=""
          className="w-8 h-8 rounded-full bg-neutral-700 object-cover"
        />
        <div className="leading-tight">
          <div className="font-medium">{user?.name || "User"}</div>
          <div className="text-xs text-neutral-400">
            {user?.lastActive ? `last active ${timeAgo(user.lastActive)}` : "—"}
          </div>
        </div>
      </div>

      {/* keep/plug your existing message list + composer below */}
      <div className="flex-1">{/* message list */}</div>
      <div>{/* composer */}</div>
    </div>
  );
}
