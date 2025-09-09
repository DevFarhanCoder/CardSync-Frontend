import React, { useEffect, useMemo, useState } from "react";
import { fetchAllGroups, fetchGroupMembers, createGroup, type Group, type UserLite } from "@/lib/chatApi";
import GroupDetailsModal from "@/components/GroupDetailsModal";
import { Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type MembersCache = Record<string, UserLite[]>;

export default function ChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Group | null>(null);
  const [membersCache, setMembersCache] = useState<MembersCache>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const uid = user?.id || "";

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { items } = await fetchAllGroups();
        // Client-side privacy guard (in case backend returns more than needed)
        const filtered = items.filter(g => g.ownerId === uid || (g.members || []).some((m) => m.id === uid));
        if (alive) setGroups(filtered);
      } catch (e: any) {
        if (alive) setErr(e?.message || "Failed to load groups");
        if (alive) setGroups([]); // don't crash/redirect
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [uid]);

  const openGroup = async (g: Group) => {
    setSelected(g);
    setModalOpen(false);
    if (!membersCache[g.id]) {
      try {
        const { members } = await fetchGroupMembers(g.id);
        setMembersCache(prev => ({ ...prev, [g.id]: members }));
      } catch {/* ignore */}
    }
  };

  const selectedMemberCount = useMemo(() => (selected && membersCache[selected.id]?.length) || 0, [selected, membersCache]);

  const handleCreate = async () => {
    const name = prompt("Group name?");
    if (!name) return;
    setCreating(true);
    try {
      const { group } = await createGroup(name);
      setGroups(prev => [{ ...group, members: [] }, ...prev]);
      setSelected(group as any);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Left list */}
      <aside className="w-full border-b border-white/10 p-3 md:w-80 md:border-b-0 md:border-r">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-200">Chats</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleCreate} disabled={creating} className="rounded-lg bg-neutral-800 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-700 disabled:opacity-50">
              <Plus className="mr-1 inline h-4 w-4" /> New
            </button>
            <button onClick={() => selected && setModalOpen(true)} disabled={!selected} className="rounded-lg bg-neutral-800 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-700 disabled:opacity-50" title="Group details">
              <Users className="mr-1 inline h-4 w-4" /> Join
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-neutral-400">Loading…</div>
        ) : err ? (
          <div className="text-sm text-red-400">{err}</div>
        ) : groups.length === 0 ? (
          <div className="text-sm text-neutral-500">No groups yet.</div>
        ) : (
          <ul className="space-y-2">
            {groups.map((g) => {
              const count = membersCache[g.id]?.length ?? g.members?.length ?? 0;
              const active = selected?.id === g.id;
              return (
                <li key={g.id}>
                  <button
                    onClick={() => openGroup(g)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left ${active ? "bg-neutral-800" : "hover:bg-neutral-800"}`}
                  >
                    <div>
                      <div className="text-sm font-medium text-neutral-100">{g.name || "Group"}</div>
                      <div className="text-xs text-neutral-400">{count} member{count === 1 ? "" : "s"}</div>
                    </div>
                    {typeof g.unreadCount === "number" && g.unreadCount > 0 && (
                      <span className="rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-semibold text-black">{g.unreadCount}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      {/* Right conversation */}
      <main className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-neutral-100">{selected?.name || "Select a group"}</div>
            {selected && <div className="text-xs text-neutral-400">{selectedMemberCount} member{selectedMemberCount === 1 ? "" : "s"}</div>}
          </div>
          {selected && (
            <button onClick={() => setModalOpen(true)} className="rounded-lg bg-neutral-800 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-700">Group details</button>
          )}
        </div>

        <div className="flex-1 p-4 text-sm text-neutral-400">
          {selected ? "No messages yet." : "Pick a group on the left to get started."}
        </div>

        <div className="border-t border-white/10 p-3">
          <input
            disabled={!selected}
            placeholder={selected ? "Type a message…" : "Select a group to start messaging"}
            className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-neutral-100 placeholder:text-neutral-500 disabled:opacity-50"
          />
        </div>
      </main>

      <GroupDetailsModal open={modalOpen} onClose={() => setModalOpen(false)} group={selected} currentUserId={uid} />
    </div>
  );
}
