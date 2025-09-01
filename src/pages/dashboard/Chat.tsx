/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, authHeaders } from "@/lib/api";

import {
  MessageCircle,
  Users,
  Plus,
  LogIn,
  Send,
  Shield,
  Copy,
  Check,
  Loader2,
  RefreshCw,
} from "lucide-react";

type Room = {
  id: string;
  name: string;
  code?: string;
  isAdmin?: boolean;
  membersCount?: number;
  createdAt?: string;
};

type Message = {
  id: string;
  roomId: string;
  userId: string;
  userName?: string;
  text: string;
  createdAt: string;
  pending?: boolean;
  failed?: boolean;
};

export default function Chat() {
  const { token } = useAuth();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomsErr, setRoomsErr] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [msgErr, setMsgErr] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState<string>(() => makeOtp());
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);

  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinErr, setJoinErr] = useState<string | null>(null);

  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;
    let alive = true;
    setLoadingRooms(true);
    setRoomsErr(null);

    (async () => {
      try {
        const res = await fetch(api("/chat/rooms"), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await safeJson(res);
        if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
        const list: Room[] = Array.isArray(data) ? data : data?.rooms || [];
        if (!alive) return;
        setRooms(list);
        setActiveId((prev) => {
          if (prev && list.some((r) => r.id === prev)) return prev;
          return list[0]?.id || null;
        });
      } catch (e: any) {
        if (!alive) return;
        setRoomsErr(e.message || "Failed to load rooms");
      } finally {
        if (alive) setLoadingRooms(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !activeId) return;

    let timer: any;
    let stopped = false;

    const tick = async () => {
      if (stopped || document.hidden) {
        timer = setTimeout(tick, 2000);
        return;
      }
      try {
        const current = messages[activeId] || [];
        const lastId = current.length ? current[current.length - 1].id : "";
        const url = lastId ? api(`/chat/rooms/${activeId}/messages?after=${encodeURIComponent(lastId)}`) : api(`/chat/rooms/${activeId}/messages`);

        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);

        const items: Message[] = Array.isArray(data) ? data : data?.items || [];
        if (items.length) {
          setMessages((prev) => ({
            ...prev,
            [activeId]: [...(prev[activeId] || []).filter(m => !m.pending), ...items],
          }));
          queueMicrotask(scrollToBottom);
        }
        setMsgErr(null);
      } catch (e: any) {
        setMsgErr(e.message || "Failed to load messages");
      } finally {
        timer = setTimeout(tick, 2000);
      }
    };

    tick();
    return () => {
      if (timer) clearTimeout(timer);
      // flag to stop further loops
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeId]);

  const activeRoom = useMemo(() => rooms.find((r) => r.id === activeId) || null, [rooms, activeId]);
  const activeMsgs = messages[activeId || ""] || [];

  const handleCreateRoom = async () => {
    if (!token) return;
    if (!roomName.trim()) {
      setCreateErr("Please enter a room name.");
      return;
    }
    setCreating(true);
    setCreateErr(null);
    try {
      const payload = { name: roomName.trim(), code: roomCode };
      const res = await fetch(api("/chat/rooms"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);

      const newRoom: Room = data?.room || data;
      setRooms((prev) => [newRoom, ...prev]);
      setActiveId(newRoom.id);
      setShowCreate(false);
      setRoomName("");
      setRoomCode(makeOtp());
    } catch (e: any) {
      setCreateErr(e.message || "Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!token) return;
    if (!/^\d{5,6}$/.test(joinCode.trim())) {
      setJoinErr("Enter a valid 5–6 digit code.");
      return;
    }
    setJoining(true);
    setJoinErr(null);
    try {
      const res = await fetch(api("/chat/join"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code: joinCode.trim() }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);

      const room: Room = data?.room || data;
      setRooms((prev) => prev.some((r) => r.id === room.id) ? prev : [room, ...prev]);
      setActiveId(room.id);
      setShowJoin(false);
      setJoinCode("");
    } catch (e: any) {
      setJoinErr(e.message || "Failed to join with that code");
    } finally {
      setJoining(false);
    }
  };

  const [copied, setCopied] = useState(false);
  const copy = async (v: string) => {
    try {
      await navigator.clipboard.writeText(v);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch { }
  };

  const [textValue, setTextValue] = useState("");
  useEffect(() => { setTextValue(text); }, [text]); // keep ESLint happy

  const handleSend = async () => {
    const t = text.trim();
    if (!token || !activeId || !t) return;
    setSending(true);

    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      roomId: activeId,
      userId: "me",
      userName: "You",
      text: t,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => ({ ...prev, [activeId]: [...(prev[activeId] || []), optimistic] }));
    setText("");
    scrollToBottom();

    try {
      const res = await fetch(api(`/chat/rooms/${activeId}/messages`), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: t }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);

      const saved: Message = data?.message || data;
      setMessages((prev) => ({
        ...prev,
        [activeId]: (prev[activeId] || [])
          .filter((m) => m.id !== optimistic.id)
          .concat(saved),
      }));
      setMsgErr(null);
      queueMicrotask(scrollToBottom);
    } catch (e: any) {
      setMessages((prev) => ({
        ...prev,
        [activeId]: (prev[activeId] || []).map((m) =>
          m.id === optimistic.id ? { ...m, pending: false, failed: true } : m
        ),
      }));
      setMsgErr(e.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const refreshRooms = async () => {
    if (!token) return;
    setLoadingRooms(true);
    setRoomsErr(null);
    try {
      const res = await fetch(api("/chat/rooms"), { headers: { Authorization: `Bearer ${token}` } });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
      const list: Room[] = Array.isArray(data) ? data : data?.rooms || [];
      setRooms(list);
    } catch (e: any) {
      setRoomsErr(e.message || "Failed to refresh");
    } finally {
      setLoadingRooms(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[320px,1fr] gap-4">
      {/* LEFT: Rooms */}
      <div className="card p-4 h-[calc(100vh-180px)] min-h-[540px] flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-[var(--subtle)]" />
            <h3 className="font-semibold">Rooms & Chats</h3>
          </div>
          <button
            className="h-8 w-8 grid place-items-center rounded-xl border border-[var(--border)] hover:bg-white/5"
            title="Refresh"
            onClick={refreshRooms}
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="btn btn-gold" onClick={() => setShowCreate(true)}>
            <Plus size={16} className="mr-1.5" /> Create Room
          </button>
          <button className="btn" onClick={() => setShowJoin(true)}>
            <LogIn size={16} className="mr-1.5" /> Join Room
          </button>
        </div>

        <div className="mt-3 text-xs text-[var(--subtle)]">
          Anyone with your OTP can join the room. Creator becomes the admin.
        </div>

        <div className="mt-4 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--muted)] flex-1">
          {loadingRooms ? (
            <div className="p-4 text-sm text-[var(--subtle)] flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} /> Loading rooms…
            </div>
          ) : roomsErr ? (
            <div className="p-4 text-sm text-red-400">{roomsErr}</div>
          ) : rooms.length === 0 ? (
            <div className="p-4 text-sm text-[var(--subtle)]">No rooms yet. Create or join one.</div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {rooms.map((r) => (
                <li
                  key={r.id}
                  className={`p-3 cursor-pointer hover:bg-white/5 ${activeId === r.id ? "bg-white/5" : ""}`}
                  onClick={() => setActiveId(r.id)}
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle size={16} className="text-[var(--subtle)]" />
                    <div className="font-medium truncate">{r.name}</div>
                    {r.isAdmin ? (
                      <span className="chip ml-auto flex items-center gap-1">
                        <Shield size={12} /> Admin
                      </span>
                    ) : (
                      <span className="chip ml-auto">{(r.membersCount ?? 1)} members</span>
                    )}
                  </div>
                  {r.isAdmin && r.code ? (
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className="text-[var(--subtle)]">Code:</span>
                      <span className="font-mono">{r.code}</span>
                      <button className="chip" onClick={() => copy(r.code!)}>
                        {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* RIGHT: Messages */}
      <div className="card p-4 h-[calc(100vh-180px)] min-h-[540px] flex flex-col">
        {!activeRoom ? (
          <div className="text-[var(--subtle)]">Select a room to start chatting.</div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageCircle size={18} className="text-[var(--subtle)]" />
                <h3 className="font-semibold">{activeRoom.name}</h3>
              </div>
              {activeRoom.isAdmin && activeRoom.code ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[var(--subtle)]">Room code:</span>
                  <span className="font-mono">{activeRoom.code}</span>
                  <button className="chip" onClick={() => copy(activeRoom.code!)}>
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              ) : null}
            </div>

            <div
              ref={listRef}
              className="flex-1 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--muted)] p-3"
            >
              {msgErr ? (
                <div className="text-sm text-red-400">{msgErr}</div>
              ) : activeMsgs.length === 0 ? (
                <div className="text-sm text-[var(--subtle)]">No messages yet. Say hi 👋</div>
              ) : (
                <ul className="space-y-2">
                  {activeMsgs.map((m) => (
                    <li key={m.id} className={`max-w-[78%] ${m.userName === "You" ? "ml-auto" : ""}`}>
                      <div
                        className={`rounded-2xl px-3 py-2 ${m.userName === "You"
                          ? "bg-[var(--gold)]/20 border border-[var(--gold)]/30"
                          : "bg-white/5 border border-[var(--border)]"
                          }`}
                      >
                        <div className="text-xs text-[var(--subtle)] mb-0.5">
                          {m.userName || truncateId(m.userId)}
                          {" · "}
                          {formatWhen(m.createdAt)}
                          {m.pending ? " · sending…" : m.failed ? " · failed" : ""}
                        </div>
                        <div className="whitespace-pre-wrap break-words">{m.text}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                className="flex-1 rounded-xl bg-[var(--muted)] border border-[var(--border)] px-3 py-2"
                placeholder="Type a message…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                className="btn btn-gold"
                onClick={handleSend}
                disabled={!text.trim() || sending}
                title="Send"
              >
                {sending ? <Loader2 className="animate-spin mr-1.5" size={16} /> : <Send size={16} className="mr-1.5" />}
                Send
              </button>
            </div>
          </>
        )}
      </div>

      {/* CREATE ROOM MODAL */}
      {showCreate && (
        <Modal onClose={() => setShowCreate(false)}>
          <h3 className="font-semibold">Create Room</h3>
          <div className="mt-3 grid gap-3">
            <input
              className="rounded-xl bg-[var(--muted)] border border-[var(--border)] px-3 py-2"
              placeholder="Room name (e.g., Sales Standup)"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <div>
              <label className="text-sm text-[var(--subtle)]">Room code (5–6 digits)</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  className="flex-1 rounded-xl bg-[var(--muted)] border border-[var(--border)] px-3 py-2 font-mono"
                  placeholder="123456"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
                <button className="chip" onClick={() => setRoomCode(makeOtp())}>Random</button>
              </div>
            </div>

            {createErr ? <div className="text-sm text-red-400">{createErr}</div> : null}

            <div className="flex items-center gap-2">
              <button className="btn btn-gold" onClick={handleCreateRoom} disabled={creating}>
                {creating ? <Loader2 className="animate-spin mr-1.5" size={16} /> : <Plus size={16} className="mr-1.5" />}
                Create
              </button>
              <button className="btn" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
            <div className="text-xs text-[var(--subtle)] flex items-center gap-1">
              <Shield size={12} /> You’ll be the admin of this room.
            </div>
          </div>
        </Modal>
      )}

      {/* JOIN ROOM MODAL */}
      {showJoin && (
        <Modal onClose={() => setShowJoin(false)}>
          <h3 className="font-semibold">Join Room</h3>
          <div className="mt-3 grid gap-3">
            <input
              className="rounded-xl bg-[var(--muted)] border border-[var(--border)] px-3 py-2 font-mono"
              placeholder="Enter 5–6 digit code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
            {joinErr ? <div className="text-sm text-red-400">{joinErr}</div> : null}
            <div className="flex items-center gap-2">
              <button className="btn btn-gold" onClick={handleJoinRoom} disabled={joining || joinCode.length < 5}>
                {joining ? <Loader2 className="animate-spin mr-1.5" size={16} /> : <LogIn size={16} className="mr-1.5" />}
                Join
              </button>
              <button className="btn" onClick={() => setShowJoin(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-md card p-6 relative">{children}</div>
      </div>
    </div>
  );
}

function makeOtp() {
  const len = Math.random() < 0.5 ? 5 : 6;
  let s = "";
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
  if (s[0] === "0") s = "1" + s.slice(1);
  return s;
}
function truncateId(id: string) { if (!id) return "user"; return id.length <= 8 ? id : id.slice(0, 4) + "…" + id.slice(-3); }
function formatWhen(iso?: string) { if (!iso) return ""; const d = new Date(iso); if (Number.isNaN(d.getTime())) return ""; return d.toLocaleString(); }
async function safeJson(res: Response) { const text = await res.text(); try { return JSON.parse(text); } catch { return { message: text }; } }
function scrollToBottom() { /* optional: keep for future */ }
