import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, authHeaders } from "@/lib/api";

import CreateJoinButtons from "@/components/chat/CreateJoinButtons";
import RoomList, { type Room } from "@/components/chat/RoomList";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import GroupInfoDrawer from "@/components/chat/GroupInfoDrawer";
import SharedPanel from "@/components/chat/SharedPanel";
import Dropdown from "@/components/ui/Dropdown";
import Modal from "@/components/ui/Modal";
import Avatar from "@/components/ui/Avatar";

export type Message = {
  id: string;
  roomId: string;
  userId: string;
  userName?: string;
  text: string;
  createdAt: number;
};

export default function Chat() {
  const { token, user } = useAuth();
  const currentUserId = user?.id ?? null;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsErr, setRoomsErr] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [msgErr, setMsgErr] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // UI state
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showShared, setShowShared] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false); // NEW
  const [showJoinModal, setShowJoinModal] = useState(false);     // NEW
  const [phone, setPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [newRoomName, setNewRoomName] = useState("");            // NEW
  const [newRoomCode, setNewRoomCode] = useState("");            // NEW

  // helpers
  const lastId = (arr: Message[]) => (arr.length ? arr[arr.length - 1].id : "");
  const setRoomMessages = (roomId: string, items: Message[], replace = false) =>
    setMessages((prev) => {
      const old = prev[roomId] || [];
      const merged = replace ? items : dedupe([...old, ...items]);
      return { ...prev, [roomId]: merged.sort((a, b) => a.createdAt - b.createdAt) };
    });
  const dedupe = (arr: Message[]) => {
    const s = new Set<string>();
    return arr.filter((m) => (s.has(m.id) ? false : (s.add(m.id), true)));
  };

  // load rooms
  useEffect(() => {
    let abort = false;
    (async () => {
      setRoomsLoading(true);
      try {
        const res = await fetch(api("/chat/rooms"), { headers: { ...authHeaders() } });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load rooms");
        if (!abort) {
          setRooms(data);
          if (!activeId && data.length) setActiveId(data[0].id);
        }
      } catch (e: any) { if (!abort) setRoomsErr(e.message); }
      finally { if (!abort) setRoomsLoading(false); }
    })();
    return () => { abort = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // poll messages
  useEffect(() => {
    if (!activeId) return;
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
    let stopped = false, fetching = false;
    const tick = async () => {
      if (fetching || stopped) return;
      fetching = true;
      try {
        const after = lastId(messages[activeId] || []);
        const url = new URL(api(`/chat/rooms/${activeId}/messages`), window.location.origin);
        if (after) url.searchParams.set("after", after);
        const res = await fetch(url.toString().replace(window.location.origin, ""), { headers: { ...authHeaders() } });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load messages");
        const items = Array.isArray(data.items) ? data.items : [];
        if (items.length) setRoomMessages(activeId, items);
      } catch (e: any) { setMsgErr(e.message || "Failed to load messages"); }
      finally { fetching = false; }
    };
    tick();
    pollingRef.current = setInterval(tick, 2500);
    return () => { stopped = true; if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // actions
  async function handleCreateRoom() {
    if (!newRoomName.trim() || !newRoomCode.trim()) return;
    const res = await fetch(api("/chat/rooms"), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ name: newRoomName.trim(), code: newRoomCode.trim() }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data?.error || "Failed to create room");
    setRooms((r) => [data.room, ...r]);
    setActiveId(data.room.id);
    setShowCreateModal(false);
    setNewRoomName(""); setNewRoomCode("");
  }
  async function handleJoinRoom(code: string) {
    const res = await fetch(api("/chat/join"), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ code: code.trim() }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data?.error || "Failed to join room");
    setRooms((prev) => (prev.some((r) => r.id === data.room.id) ? prev : [data.room, ...prev]));
    setActiveId(data.room.id);
    setShowJoinModal(false);
  }
  async function send(text: string) {
    if (!activeId) return;
    const res = await fetch(api(`/chat/rooms/${activeId}/messages`), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data?.error || "Failed to send");
    // ensure the added message has currentUserId so it renders on the right
    if (data.message) setRoomMessages(activeId, [{ ...data.message, userId: currentUserId! }]);
  }

  // header actions
  const activeRoom = rooms.find((r) => r.id === activeId) || null;
  const isAdmin = !!activeRoom?.isAdmin;

  async function renameRoom() { /* …kept from earlier: PUT /api/chat/rooms/:id … */ }
  async function deleteGroup() { /* …DELETE /api/chat/rooms/:id… */ }
  async function inviteByPhone() { /* …POST /api/chat/rooms/:id/invite-phone… */ }
  async function leaveGroup() { /* …POST /api/chat/rooms/:id/leave … */ }
  async function updateDescription(desc: string) {
    if (!activeId) return;
    await fetch(api(`/chat/rooms/${activeId}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ description: desc }),
    });
  }
  async function uploadPhoto(file: File) {
    if (!activeId) return;
    const fd = new FormData();
    fd.append("photo", file);
    const res = await fetch(api(`/chat/rooms/${activeId}/photo`), {
      method: "POST",
      headers: { ...authHeaders() },
      body: fd,
    });
    const data = await res.json();
    if (res.ok) {
      setRooms((prev) => prev.map((r) => (r.id === activeId ? { ...r, photoURL: data.photoURL } : r)));
    }
  }

  const actionsMenu = [
    { label: "Group info", onClick: () => setShowGroupInfo(true) },
    { label: "Details (Media / Docs / Links)", onClick: () => setShowShared(true) },
    { label: "Rename group", onClick: () => { setNewName(activeRoom?.name || ""); setShowRenameModal(true); }, disabled: !isAdmin },
    { label: "Add by phone", onClick: () => setShowInviteModal(true), disabled: !isAdmin },
    { label: "Leave group", onClick: () => leaveGroup() },
    { label: "Delete group", onClick: () => setShowDeleteConfirm(true), danger: true, disabled: !isAdmin },
  ];

  const activeMessages = activeId ? messages[activeId] || [] : [];

  return (
    <div className="h-[calc(100vh-64px)] grid grid-cols-12">
      {/* Left column */}
      <div className="col-span-3 border-r border-[var(--border)] bg-[var(--panel)] flex flex-col">
        <div className="flex items-center justify-between p-3">
          <div className="font-semibold">Rooms & Chats</div>
          <button
            className="rounded-full p-1 text-zinc-400 hover:text-white"
            onClick={() => {
              setRoomsLoading(true);
              fetch(api("/chat/rooms"), { headers: { ...authHeaders() } })
                .then((r) => r.json())
                .then((d) => setRooms(Array.isArray(d) ? d : []))
                .finally(() => setRoomsLoading(false));
            }}
            aria-label="Refresh"
            title="Refresh"
          >
            ↻
          </button>
        </div>

        <div className="px-3 pb-3 flex gap-2">
          <button className="rounded-full bg-yellow-400 px-4 py-2 font-medium text-black" onClick={() => setShowCreateModal(true)}>+ Create Room</button>
          <button className="rounded-full bg-zinc-700 px-4 py-2 font-medium text-white" onClick={() => setShowJoinModal(true)}>↳ Join Room</button>
        </div>

        {roomsErr && <div className="px-3 text-xs text-red-400">{roomsErr}</div>}
        {roomsLoading && <div className="px-3 text-xs text-zinc-400">Loading rooms…</div>}

        <div className="min-h-0 flex-1">
          <RoomList rooms={rooms} activeId={activeId} onSelectRoom={setActiveId} />
        </div>
      </div>

      {/* Middle column: header + messages */}
      <div className="col-span-9 flex flex-col bg-[var(--bg)]">
        <div className="px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
          {activeRoom ? (
            <div className="flex items-center gap-3">
              <Avatar name={activeRoom.name} src={activeRoom.photoURL} />
              <div className="leading-tight">
                <div className="font-semibold truncate">{activeRoom.name}</div>
                <div className="text-[11px] text-zinc-400">{activeRoom.membersCount} members</div>
              </div>
            </div>
          ) : (
            <div className="font-semibold">Select a room</div>
          )}

          {!!activeRoom && (
            <Dropdown
              trigger={<button className="rounded-md px-2 py-1 text-zinc-300 hover:bg-zinc-800" title="More">⋮</button>}
              items={actionsMenu}
            />
          )}
        </div>

        <MessageList items={activeMessages} currentUserId={currentUserId} />
        <MessageInput onSend={send} disabled={!activeId} />
        {msgErr && <div className="px-4 py-2 text-xs text-red-400">{msgErr}</div>}
      </div>

      {/* Drawers / Panels */}
      {!!activeRoom && (
        <>
          <GroupInfoDrawer
            isOpen={showGroupInfo}
            onClose={() => setShowGroupInfo(false)}
            room={{
              id: activeRoom.id,
              name: activeRoom.name,
              createdAt: activeRoom.createdAt as any,
              code: activeRoom.code,
              isAdmin,
              description: activeRoom.description,
              photoURL: activeRoom.photoURL,
            }}
            members={[{ userId: currentUserId || "you", name: "You", role: isAdmin ? "admin" : "member" }]}
            currentUserId={currentUserId}
            onMakeAdmin={(uid) => alert(`Make admin -> ${uid}`)}
            onRemoveFromGroup={(uid) => alert(`Remove -> ${uid}`)}
            onLeaveGroup={leaveGroup}
            onOpenDM={(uid) => alert(`Open DM with ${uid}`)}
            onCopyCode={() => navigator.clipboard.writeText(activeRoom.code || "")}
            onInviteByPhone={() => setShowInviteModal(true)}
            onRename={() => { setNewName(activeRoom.name); setShowRenameModal(true); }}
            onDeleteGroup={() => setShowDeleteConfirm(true)}
            onUpdateDescription={updateDescription}
            onUploadPhoto={uploadPhoto}
            onOpenDetails={() => { setShowGroupInfo(false); setShowShared(true); }}
          />
          <SharedPanel open={showShared} onClose={() => setShowShared(false)} />
        </>
      )}

      {/* Create Room */}
      <Modal open={showCreateModal} title="Create room" onClose={() => setShowCreateModal(false)}>
        <div className="space-y-3">
          <input className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none" placeholder="Room name" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} />
          <input className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none" placeholder="Room code (5–6 digits)" value={newRoomCode} onChange={(e) => setNewRoomCode(e.target.value)} />
          <div className="flex justify-end gap-2">
            <button className="px-3 py-2 rounded-lg border border-zinc-700" onClick={() => setShowCreateModal(false)}>Cancel</button>
            <button className="px-3 py-2 rounded-lg bg-yellow-400 text-black" onClick={handleCreateRoom}>Create</button>
          </div>
        </div>
      </Modal>

      {/* Join Room */}
      <Modal open={showJoinModal} title="Join room" onClose={() => setShowJoinModal(false)}>
        <JoinForm onSubmit={(code) => handleJoinRoom(code)} />
      </Modal>

      {/* Invite / Rename / Delete modals same as before… */}
      {/* … keep from your previous step (Invite by phone / Rename / Delete confirm) */}
    </div>
  );
}

function JoinForm({ onSubmit }: { onSubmit: (code: string) => void }) {
  const [code, setCode] = useState("");
  return (
    <div className="space-y-3">
      <input className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none" placeholder="Room code" value={code} onChange={(e) => setCode(e.target.value)} />
      <div className="flex justify-end gap-2">
        <button className="px-3 py-2 rounded-lg border border-zinc-700" onClick={() => setCode("")}>Clear</button>
        <button className="px-3 py-2 rounded-lg bg-emerald-600 text-black" onClick={() => onSubmit(code)}>Join</button>
      </div>
    </div>
  );
}
