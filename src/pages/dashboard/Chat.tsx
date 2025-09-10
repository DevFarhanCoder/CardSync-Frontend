import React, { useEffect, useState } from "react";
import { fetchAllGroups, type Group } from "@/lib/chatApi";
import { MoreHorizontal, PlusCircle, QrCode, ArrowLeft } from "lucide-react";
import GroupRightPanel from "@/components/GroupRightPanel";
import CreateGroupModal from "@/components/CreateGroupModal";
import JoinGroupModal from "@/components/JoinGroupModal";

export default function ChatPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [selected, setSelected] = useState<Group | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAllGroups();
        setGroups(data.items || []);
      } catch (e: any) { setErr(e.message || String(e)); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[#0d1117]">
      {/* Sidebar (full-width on mobile, fixed width on md+) */}
      <aside className={`${selected ? "hidden md:flex" : "flex"} h-full w-full md:max-w-[360px] shrink-0 flex-col border-r border-white/10 bg-[#0b0e12]`}>
        <div className="flex items-center justify-between gap-2 p-3">
          <div className="text-sm font-semibold text-neutral-100">Groups</div>
          <div className="flex gap-2">
            <button onClick={()=>setShowJoin(true)} className="rounded-full bg-neutral-800 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-700 flex items-center gap-1"><QrCode className="h-4 w-4"/> Join</button>
            <button onClick={()=>setShowCreate(true)} className="rounded-full bg-yellow-400 px-3 py-1.5 text-xs font-medium text-black hover:opacity-90 flex items-center gap-1"><PlusCircle className="h-4 w-4"/> Create</button>
          </div>
        </div>
        <div className="h-[1px] w-full bg-white/10" />
        <div className="flex-1 overflow-auto px-3 pb-3">
          {loading ? (
            <div className="px-1 text-sm text-neutral-400">Loading…</div>
          ) : err ? (
            <div className="px-1 text-sm text-red-400">{err}</div>
          ) : groups.length === 0 ? (
            <div className="px-1 text-sm text-neutral-500">No groups yet. Create or join using code.</div>
          ) : (
            <ul className="space-y-2">
              {groups.map((g) => {
                const active = selected?.id === g.id;
                const preview = (g.lastMessageText && g.lastMessageText.trim()) || "No messages yet.";
                const when = g.lastMessageAt ? new Date(g.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
                return (
                  <li key={g.id}>
                    <button onClick={() => setSelected(g)} className={`w-full rounded-xl p-3 text-left ${active ? "bg-neutral-800" : "hover:bg-neutral-800"}`}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-neutral-100 truncate">{g.name || "Group"}</div>
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

      {/* Main chat area (hidden on mobile until a group is selected) */}
      <main className={`${selected ? "flex" : "hidden md:flex"} h-full flex-1 flex-col`}>
        <div className="flex h-12 items-center justify-between border-b border-white/10 px-3">
          <div className="flex items-center gap-2">
            <button onClick={()=>setSelected(null)} className="md:hidden rounded-full p-1.5 hover:bg-white/10">
              <ArrowLeft className="h-5 w-5 text-neutral-300" />
            </button>
            <div className="text-sm font-medium text-neutral-200 truncate">{selected ? selected.name : "Select a group"}</div>
          </div>
          <button onClick={()=>selected && setDrawerOpen(true)} disabled={!selected} className="rounded-full p-1.5 hover:bg-white/10 disabled:opacity-50">
            <MoreHorizontal className="h-5 w-5 text-neutral-300" />
          </button>
        </div>

        {/* Messages list - placeholder */}
        <div className="flex-1 overflow-auto p-3 md:p-6 text-sm text-neutral-400">
          {selected ? "Start chatting… (message list & input go here)" : "Choose a group from the left or create/join one."}
        </div>

        <div className="border-t border-white/10 p-3">
          <input disabled={!selected} placeholder={selected ? "Type a message…" : "Select a group to start chatting"} className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-neutral-100 placeholder:text-neutral-500 disabled:opacity-50" />
        </div>
      </main>

      {/* Right drawer */}
      <GroupRightPanel open={drawerOpen} onClose={()=>setDrawerOpen(false)} group={selected} />

      {/* Modals */}
      <CreateGroupModal open={showCreate} onClose={()=>setShowCreate(false)} />
      <JoinGroupModal open={showJoin} onClose={()=>setShowJoin(false)} />
    </div>
  );
}
