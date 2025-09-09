import React, { useEffect, useMemo, useState } from "react";
import { fetchAllGroups, fetchGroupMembers, createGroup, type Group, type UserLite } from "@/lib/chatApi";
import GroupDetailsModal from "@/components/GroupDetailsModal";
import { Plus, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserId } from "@/utils/getUserId";

type MembersCache = Record<string, UserLite[]>;

export default function ChatPage() {
  const { user } = useAuth();
  const uid = getUserId(user);

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Group | null>(null);
  const [membersCache, setMembersCache] = useState<MembersCache>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const { items } = await fetchAllGroups();
        // Keep only groups where user is owner or member
        const filtered = items.filter(g => g.ownerId === uid || (g.members || []).some(m => m.id === uid));
        if (alive) setGroups(filtered);
        if (alive && filtered.length && !selected) setSelected(filtered[0]);
      } catch (e: any) {
        if (alive) { setErr(e?.message || "Failed to load groups"); setGroups([]); }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [uid]);

  const openGroup = async (g: Group) => {
    setSelected(g);
    if (!membersCache[g.id]) {
      try {
        const { members } = await fetchGroupMembers(g.id);
        setMembersCache(prev => ({ ...prev, [g.id]: members }));
      } catch { }
    }
  };

  const selectedMemberCount = useMemo(
    () => (selected && membersCache[selected.id]?.length) || 0,
    [selected, membersCache]
  );

  const handleCreate = async () => {
    const name = prompt("Group name?");
    if (!name) return;
    setCreating(true);
    try {
      const { group } = await createGroup(name);
      setGroups(prev => [group, ...prev]);
      setSelected(group);
    } finally {
      setCreating(false);
    }
  };

  const containerHeight = "calc(100vh - 72px)";

  return (
    <div className="flex flex-col md:flex-row" style={{ height: containerHeight }}>
      {/* Left list */}
      <aside className="w-full border-b border-white/10 md:w-[320px] md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-semibold text-neutral-200">Chats</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleCreate} disabled={creating} className="rounded-lg bg-neutral-800 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-700 disabled:opacity-50">
              <Plus className="mr-1 inline h-4 w-4" /> New
            </button>
            <button onClick={() => selected && setModalOpen(true)} disabled={!selected} className="rounded-lg bg-neutral-800 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-700 disabled:opacity-50">
              <Users className="mr-1 inline h-4 w-4" /> Group details
            </button>
          </div>
        </div>

        <div className="h-[calc(100%-56px)] overflow-auto px-3 pb-3">
          {loading ? (
            <div className="px-1 text-sm text-neutral-400">Loading…</div>
          ) : err ? (
            <div className="px-1 text-sm text-red-400">{err}</div>
          ) : groups.length === 0 ? (
            <div className="px-1 text-sm text-neutral-500">No groups yet.</div>
          ) : (
            <ul className="space-y-2">
              {groups.map((g) => {
                const active = selected?.id === g.id;
                const preview = (g.lastMessageText && g.lastMessageText.trim()) || "No messages yet.";
                const when = g.lastMessageAt ? new Date(g.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
                return (
                  <li key={g.id}>
                    <button onClick={() => openGroup(g)} className={`w-full rounded-xl px-3 py-2 text-left ${active ? "bg-neutral-800" : "hover:bg-neutral-800"}`}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-neutral-100">{g.name || "Group"}</div>
                        <div className="ml-3 shrink-0 text-[11px] text-neutral-400">{when}</div>
                      </div>
                      <div className="mt-0.5 line-clamp-1 text-xs text-neutral-400">{preview}</div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* Right conversation */}
      <main className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-neutral-100">{selected?.name || "Select a group"}</div>
            {selected && <div className="text-xs text-neutral-400">{selectedMemberCount} member{selectedMemberCount === 1 ? "" : "s"}</div>}
          </div>
          {selected && <button onClick={() => setModalOpen(true)} className="rounded-lg bg-neutral-800 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-700">Group details</button>}
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4 text-sm text-neutral-400">
          {selected ? "No messages yet." : "Pick a group on the left to get started."}
        </div>

        <div className="border-t border-white/10 p-3">
          <input disabled={!selected} placeholder={selected ? "Type a message…" : "Select a group to start messaging"} className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-neutral-100 placeholder:text-neutral-500 disabled:opacity-50" />
        </div>
      </main>

      <GroupDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        group={selected}
        currentUser={user}
      />
    </div>
  );
}
