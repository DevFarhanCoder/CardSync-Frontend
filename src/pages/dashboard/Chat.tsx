import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getJson, postJson, authHeaders } from "@/lib/api";
import GroupInfoDrawer from "@/components/chat/GroupInfoDrawer";
import RoomList from "@/components/chat/RoomList";
import MessageList from "@/components/chat/MessageList";
import { MoreVertical, Plus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Avatar from "@/components/ui/Avatar";

type Room = { id: string; name: string; code: string; isAdmin: boolean; members: string[] };
type Message = { id: string; roomId: string; userId: string; text?: string; kind?: "text"|"card"; payload?: any; createdAt: string };

export default function Chat() {
  const { user } = useAuth();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [infoOpen, setInfoOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const pollRef = useRef<number | null>(null);

  const showToast = (t: string) => { setToast(t); setTimeout(() => setToast(null), 1500); };

  async function loadRooms() {
    const data = await getJson("/api/chat/rooms");
    const list: Room[] = (data.rooms || []).map((r: any) => ({
      id: r.id, name: r.name, code: r.code, isAdmin: !!r.isAdmin, members: r.members || [],
    }));
    setRooms(list);
    if (!activeRoom && list.length) setActiveRoom(list[0]);
  }

  async function loadMessages(roomId: string) {
    const data = await getJson(`/api/chat/rooms/${roomId}/messages`);
    const list: Message[] = (data.messages || []).map((m: any) => ({
      id: m.id, roomId: m.roomId, userId: m.userId, text: m.text, kind: m.kind, payload: m.payload,
      createdAt: typeof m.createdAt === "string" ? m.createdAt : new Date(m.createdAt).toISOString(),
    }));
    setMsgs(list);
  }

  useEffect(() => { loadRooms(); }, []);

  // load + poll messages for active room
  useEffect(() => {
    if (!activeRoom) return;
    loadMessages(activeRoom.id);

    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = window.setInterval(() => loadMessages(activeRoom.id), 4000);
    return () => { if (pollRef.current) window.clearInterval(pollRef.current); };
  }, [activeRoom?.id]);

  // actions
  async function createRoom() {
    if (!roomName.trim()) return;
    const data = await postJson("/api/chat/rooms", { name: roomName.trim() });
    setCreateOpen(false); setRoomName("");
    await loadRooms();
    setActiveRoom({
      id: data.room.id, name: data.room.name, code: data.room.code, isAdmin: true, members: data.room.members || [],
    });
    showToast("Group created");
  }
  async function joinByCode() {
    if (!joinCode.trim()) return;
    await postJson("/api/chat/join", { code: joinCode.trim() });
    setJoinOpen(false); setJoinCode("");
    await loadRooms(); showToast("Joined group");
  }
  async function send(text: string) {
    if (!activeRoom || !text.trim()) return;
    const r = await fetch(`/api/chat/rooms/${activeRoom.id}/messages`, {
      method: "POST", headers: authHeaders(), body: JSON.stringify({ text }),
    }).then((x) => x.json());
    setMsgs((prev) => [...prev, r.message]);
  }

  return (
    <div className="h-full min-h-0 grid grid-cols-[320px,1fr]">
      {/* LEFT: full-height Chats list */}
      <aside className="min-h-0 flex flex-col border-r border-[var(--border)]">
        <div className="px-3 py-3 flex items-center justify-between border-b border-[var(--border)]">
          <div className="font-semibold">Chats</div>
          <div className="flex gap-2">
            <button className="chip" onClick={() => setCreateOpen(true)}>
              <Plus size={14} className="mr-1" /> New
            </button>
            <button className="chip" onClick={() => setJoinOpen(true)}>Join</button>
          </div>
        </div>

        {/* scrollable list */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3">
          <RoomList
            rooms={rooms}
            activeId={activeRoom?.id || ""}
            onSelectRoom={(r: any) => setActiveRoom(r)}
          />
        </div>
      </aside>

      {/* RIGHT: full-height messages column */}
      <section className="min-h-0 flex flex-col">
        {!activeRoom ? (
          <div className="flex-1 grid place-items-center text-[var(--subtle)]">Select a group</div>
        ) : (
          <>
            {/* sticky header */}
            <div className="h-[56px] shrink-0 border-b border-[var(--border)] flex items-center justify-between px-4 z-10">
              <div className="flex items-center gap-2">
                <Avatar name={activeRoom.name} />
                <div className="font-semibold">{activeRoom.name}</div>
              </div>
              <button className="chip" title="Group details" onClick={() => setInfoOpen(true)}>
                <MoreVertical size={16} />
              </button>
            </div>

            {/* scrollable messages */}
            <div className="flex-1 min-h-0">
              <MessageList items={msgs} currentUserId={user?.id || ""} />
            </div>

            {/* input */}
            <div className="shrink-0 border-t border-[var(--border)] px-4 py-3 flex items-center gap-3">
              <input
                className="flex-1 rounded-xl bg-[#1b1f26] border border-[var(--border)] px-3 py-2"
                placeholder="Type a message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const v = (e.target as HTMLInputElement).value;
                    (e.target as HTMLInputElement).value = "";
                    send(v);
                  }
                }}
              />
              <button
                className="btn btn-gold"
                onClick={() => {
                  const el = document.activeElement as HTMLInputElement | null;
                  const v = el?.value || "";
                  if (el) el.value = "";
                  send(v);
                }}
              >
                Send
              </button>
            </div>
          </>
        )}
      </section>

      {/* group details drawer */}
      <GroupInfoDrawer
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        roomId={activeRoom?.id || ""}
        isAdmin={!!activeRoom?.isAdmin}
        onChanged={async () => {
          await loadRooms();
          if (activeRoom) await loadMessages(activeRoom.id);
        }}
      />

      {/* Create */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Group">
        <div className="space-y-3">
          <input className="w-full rounded-xl bg-transparent border px-3 py-2" placeholder="Group name"
                 value={roomName} onChange={(e) => setRoomName(e.target.value)} />
          <div className="text-xs text-[var(--subtle)]">A unique join code will be generated automatically.</div>
          <button className="btn btn-gold" onClick={createRoom}>Create</button>
        </div>
      </Modal>

      {/* Join */}
      <Modal open={joinOpen} onClose={() => setJoinOpen(false)} title="Join via Code">
        <div className="space-y-3">
          <input className="w-full rounded-xl bg-transparent border px-3 py-2" placeholder="Enter group code"
                 value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
          <button className="btn btn-gold" onClick={joinByCode}>Join</button>
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[70] bg-black/90 text-white text-sm px-4 py-2 rounded-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
