import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, authHeaders } from "@/lib/api";
import RoomList, { type Room } from "@/components/chat/RoomList";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import GroupInfoDrawer from "@/components/chat/GroupInfoDrawer";
import Dropdown from "@/components/ui/Dropdown";
import Modal from "@/components/ui/Modal";
import Avatar from "@/components/ui/Avatar";

export type Message = {
  id: string;
  roomId: string;
  userId: string;
  text: string;
  createdAt: number;
};

export default function Chat() {
  const { token, user } = useAuth();
  const currentUserId = user?.id ?? null;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // load rooms
  useEffect(() => {
    (async () => {
      try {
       const res = await fetch(api("/chat/rooms"), { headers: { ...authHeaders() } });
        const data = await res.json();
        if (res.ok) {
          setRooms(data);
          if (!activeId && data.length) setActiveId(data[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [token]);


  // leave group
  async function handleLeaveGroup() {
    if (!activeId) return;
    const res = await fetch(api(`/groups/${activeId}/leave`), {
      method: "POST",
      headers: { ...authHeaders() },
    });
    if (res.ok) {
      setRooms((prev) => prev.filter((r) => r.id !== activeId));
      setActiveId(null);
      setShowGroupInfo(false);
    }
  }

  // rename group
  async function handleRenameGroup(newName: string) {
    if (!activeId) return;
    const res = await fetch(api(`/groups/${activeId}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ name: newName }),
    });
    const data = await res.json();
    if (res.ok) {
      setRooms((prev) => prev.map((r) => (r.id === activeId ? { ...r, name: data.name } : r)));
    }
  }

  // update description
  async function handleUpdateDescription(desc: string) {
    if (!activeId) return;
    await fetch(api(`/groups/${activeId}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ description: desc }),
    });
    setRooms((prev) => prev.map((r) => (r.id === activeId ? { ...r, description: desc } : r)));
  }

  // upload photo
  async function handleUploadPhoto(file: File) {
    if (!activeId) return;
    const formData = new FormData();
    formData.append("photo", file);
    const res = await fetch(api(`/groups/${activeId}/photo`), {
      method: "POST",
      headers: { ...authHeaders() },
      body: formData,
    });
    const data = await res.json();
    if (res.ok) {
      setRooms((prev) => prev.map((r) => (r.id === activeId ? { ...r, photoURL: data.photoURL } : r)));
    }
  }

  async function handleCreate(name: string, code: string) {
    const res = await fetch(api("/chat/rooms"), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ name, code }),
    });
    const data = await res.json();
    if (res.ok) {
      setRooms((r) => [data.room, ...r]);
      setActiveId(data.room.id);
      setShowCreateModal(false);
    }
  }

  async function handleJoin(code: string) {
    const res = await fetch(api("/chat/join"), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (res.ok) {
      setRooms((r) => [data.room, ...r]);
      setActiveId(data.room.id);
      setShowJoinModal(false);
    }
  }

  async function send(text: string) {
    if (!activeId) return;
    const res = await fetch(api(`/chat/rooms/${activeId}/messages`), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessages((prev) => {
        const arr = prev[activeId] || [];
        return { ...prev, [activeId]: [...arr, { ...data.message, userId: currentUserId! }] };
      });
    }
  }

  const activeRoom = rooms.find((r) => r.id === activeId) || null;
  const msgs = activeId ? messages[activeId] || [] : [];

  return (
    <div className="h-[calc(100vh-64px)] grid grid-cols-12">
      {/* Sidebar */}
      <div className="col-span-3 border-r bg-[var(--panel)] flex flex-col">
        <div className="flex items-center justify-between p-3">
          <div className="font-semibold">Chats</div>
          <button className="px-2 py-1 rounded bg-yellow-400 text-black" onClick={() => setShowCreateModal(true)}>
            + New
          </button>
        </div>
        <RoomList rooms={rooms} activeId={activeId} onSelectRoom={setActiveId} />
      </div>

      {/* Chat */}
      <div className="col-span-9 flex flex-col bg-[var(--bg)]">
        {activeRoom ? (
          <>
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center gap-3">
                <Avatar name={activeRoom.name} src={activeRoom.photoURL} />
                <div>
                  <div className="font-semibold">{activeRoom.name}</div>
                  <div className="text-xs text-gray-400">{activeRoom.membersCount} members</div>
                </div>
              </div>
              <Dropdown
                trigger={<button className="px-2 py-1 hover:bg-gray-700 rounded">⋮</button>}
                items={[
                  { label: "Group info", onClick: () => setShowGroupInfo(true) },
                  { label: "Leave group", onClick: () => console.log("leave") },
                ]}
              />
            </div>
            <MessageList items={msgs} currentUserId={currentUserId} />
            <MessageInput onSend={send} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">Select a room</div>
        )}
      </div>

      {activeRoom && (
        <GroupInfoDrawer
          isOpen={showGroupInfo}
          onClose={() => setShowGroupInfo(false)}
          room={activeRoom}
          members={[{ userId: currentUserId || "me", name: "You", role: "admin" }]}
          currentUserId={currentUserId}
          onMakeAdmin={() => { }}
          onRemoveFromGroup={() => { }}
          onLeaveGroup={handleLeaveGroup}
          onOpenDM={() => { }}
          onCopyCode={() => navigator.clipboard.writeText(activeRoom.code || "")}
          onInviteByPhone={() => { }}
          onRename={() => handleRenameGroup(prompt("Enter new name") || activeRoom.name)}
          onDeleteGroup={() => { }}
          onUpdateDescription={handleUpdateDescription}
          onUploadPhoto={handleUploadPhoto}
          onOpenDetails={() => { }}
        />

      )}

      {/* Create Modal */}
      <Modal open={showCreateModal} title="Create Room" onClose={() => setShowCreateModal(false)}>
        <CreateRoomForm onSubmit={handleCreate} />
      </Modal>

      {/* Join Modal */}
      <Modal open={showJoinModal} title="Join Room" onClose={() => setShowJoinModal(false)}>
        <JoinRoomForm onSubmit={handleJoin} />
      </Modal>
    </div>
  );
}

function CreateRoomForm({ onSubmit }: { onSubmit: (name: string, code: string) => void }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  return (
    <div className="space-y-3">
      <input className="w-full p-2 rounded bg-gray-800" placeholder="Room name" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="w-full p-2 rounded bg-gray-800" placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} />
      <button className="px-3 py-2 bg-yellow-400 rounded" onClick={() => onSubmit(name, code)}>Create</button>
    </div>
  );
}

function JoinRoomForm({ onSubmit }: { onSubmit: (code: string) => void }) {
  const [code, setCode] = useState("");
  return (
    <div className="space-y-3">
      <input className="w-full p-2 rounded bg-gray-800" placeholder="Room code" value={code} onChange={(e) => setCode(e.target.value)} />
      <button className="px-3 py-2 bg-emerald-600 rounded text-black" onClick={() => onSubmit(code)}>Join</button>
    </div>
  );
}
