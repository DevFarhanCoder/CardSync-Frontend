import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { getJson, postJson } from "@/lib/api";
import { Copy, Trash2, UserPlus, Users } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { Link } from "react-router-dom";

type Member = { id: string; name?: string; email?: string; phone?: string };
type RoomDetails = { id: string; name: string; code: string; members: Member[] };

export default function GroupInfoDrawer({
  open,
  onClose,
  roomId,
  isAdmin,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  roomId: string;
  isAdmin: boolean;
  onChanged?: () => void;
}) {
  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [addPhone, setAddPhone] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function load() {
    if (!roomId) return;
    const r = await getJson(`/api/chat/rooms/${roomId}`);
    setRoom(r.room);
  }

  useEffect(() => { if (open) load(); }, [open, roomId]);

  function copyCode() {
    if (!room) return;
    navigator.clipboard.writeText(room.code).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1200);
    });
  }

  async function addMember() {
    if (!room || !addPhone.trim()) return;
    setAdding(true);
    try {
      await postJson(`/api/chat/rooms/${room.id}/members/add`, { phone: addPhone.trim() });
      setAddPhone("");
      await load();
      onChanged && onChanged();
    } finally { setAdding(false); }
  }

  async function removeMember(uid: string) {
    if (!room) return;
    setRemovingId(uid);
    try {
      await postJson(`/api/chat/rooms/${room.id}/members/remove`, { userId: uid });
      await load();
      onChanged && onChanged();
    } finally { setRemovingId(null); }
  }

  const pretty = (m: Member) => m.name || m.email || m.phone || "Unknown user";

  return (
    <Modal open={open} onClose={onClose} title="Group details">
      {!room ? (
        <div className="text-[var(--subtle)] p-2">Loading…</div>
      ) : (
        <div className="space-y-6">
          {/* Join code */}
          <div className="rounded-xl border border-[var(--border)] p-4">
            <div className="font-semibold mb-2">Join code</div>
            <div className="flex gap-2 items-center">
              <input readOnly className="rounded-xl bg-transparent border px-3 py-2 w-48 text-center tracking-widest" value={room.code} />
              <button className="chip" onClick={copyCode}>
                <Copy size={14} /> <span className="ml-1">{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div className="text-xs text-[var(--subtle)] mt-2">Anyone can join this group using the code.</div>
          </div>

          {/* Members */}
          <div className="rounded-xl border border-[var(--border)] p-4">
            <div className="font-semibold mb-2 flex items-center gap-2"><Users size={16}/> Members</div>
            <ul className="space-y-2">
              {room.members.map((m) => (
                <li key={m.id} className="flex items-center justify-between">
                  <Link
                    to={`/public/profile/${m.id}/cards`}
                    className="flex items-center gap-3 hover:opacity-90"
                    title="Open profile"
                  >
                    <Avatar name={pretty(m)} />
                    <div>
                      <div className="font-medium">{pretty(m)}</div>
                      <div className="text-xs text-[var(--subtle)]">
                        {[m.email, m.phone].filter(Boolean).join(" • ") || "—"}
                      </div>
                    </div>
                  </Link>
                  {isAdmin && (
                    <button className="chip" onClick={() => removeMember(m.id)} disabled={removingId === m.id} title="Remove">
                      <Trash2 size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Add by phone (admin only) */}
          {isAdmin && (
            <div className="rounded-xl border border-[var(--border)] p-4">
              <div className="font-semibold mb-2 flex items-center gap-2">
                <UserPlus size={16}/> Add member by phone
              </div>
              <div className="flex gap-2">
                <input
                  className="rounded-xl bg-transparent border px-3 py-2 flex-1"
                  placeholder="e.g. +91 98679 69445"
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                />
                <button className="btn btn-gold" onClick={addMember} disabled={adding}>Add</button>
              </div>
              <div className="text-xs text-[var(--subtle)] mt-2">
                The phone number must be associated with an existing account.
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
