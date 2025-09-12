import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

type Group = { id?: string; name?: string };

export default function Chat() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.groups()
      .then((res) => setGroups(res.groups || []))
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <div className="min-h-screen p-6 text-white">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Groups</h3>
          <div className="flex gap-2">
            <button className="px-2 py-1 rounded bg-white/10">Join</button>
            <button className="px-2 py-1 rounded bg-white/10">Create</button>
          </div>
        </div>
        {err && <div className="text-red-400 text-sm mb-2">{err}</div>}
        <ul className="space-y-2">
          {groups.map((g, i) => (
            <li key={g.id || i} className="rounded bg-white/5 p-2">{g.name || "Untitled Group"}</li>
          ))}
          {!groups.length && !err && <li className="text-white/60 text-sm">No groups yet.</li>}
        </ul>
      </div>
    </div>
  );
}