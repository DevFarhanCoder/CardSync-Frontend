import React, { useEffect, useMemo, useState } from "react";
import { addMemberByPhone, fetchGroupMembers, joinByCode, type Group, type UserLite } from "@/lib/chatApi";
import { Phone, MessageSquare, User as UserIcon, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = { open: boolean; onClose: () => void; group: Group | null; currentUserId: string; };

const cleanPhone = (s: string) => s.replace(/[^\d+]/g, "");

export default function GroupDetailsModal({ open, onClose, group, currentUserId }: Props) {
  const [members, setMembers] = useState<UserLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open || !group?.id) return;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const { members } = await fetchGroupMembers(group.id);
        if (alive) setMembers(members);
      } catch (e: any) {
        if (alive) setError(e?.message || "Failed to load members");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; setMembers([]); setError(null); };
  }, [open, group?.id]);

  const memberCount = useMemo(() => members.length, [members]);

  const handleAdd = async () => {
    const p = cleanPhone(phone);
    if (!p || !group) return;
    setAdding(true);
    setError(null);
    try {
      await addMemberByPhone(group.id, p);
      const { members } = await fetchGroupMembers(group.id);
      setMembers(members);
      setPhone("");
    } catch (e: any) {
      setError(e?.message || "Failed to add member");
    } finally {
      setAdding(false);
    }
  };

  const call = (m: UserLite) => m.phone && window.open(`tel:${cleanPhone(m.phone)}`, "_self");
  const dm = (m: UserLite) => navigate(`/dashboard/chat/direct/${m.id}`);

  const doJoin = async () => {
    if (!code.trim()) return;
    setJoining(true);
    try {
      await joinByCode(code.trim());
      setCode("");
      onClose();
      // Optionally refresh the page/group list outside
    } catch (e: any) {
      setError(e?.message || "Invalid code");
    } finally {
      setJoining(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-[620px] rounded-2xl bg-neutral-900 p-4 shadow-xl ring-1 ring-white/10 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white md:text-lg">Group details</h3>
          <button onClick={onClose} className="rounded-full px-2 py-1 text-sm text-neutral-300 hover:bg-white/10">✕</button>
        </div>

        {group?.joinCode && (
          <div className="mb-4 rounded-xl border border-white/10 p-3 md:p-4">
            <div className="mb-1 text-sm text-neutral-400">Join code</div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input value={group.joinCode} readOnly className="w-36 rounded-lg bg-neutral-800 px-3 py-2 text-center font-mono text-white" />
              <button onClick={() => navigator.clipboard.writeText(group.joinCode!)} className="inline-flex items-center gap-2 rounded-lg bg-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700">
                <Copy className="h-4 w-4" /> Copy
              </button>
              <div className="ml-auto flex-1 sm:ml-4">
                <div className="flex gap-2">
                  <input value={code} onChange={(e)=>setCode(e.target.value)} placeholder="Enter code to join a group" className="flex-1 rounded-lg bg-neutral-800 px-3 py-2 text-white placeholder:text-neutral-500" />
                  <button onClick={doJoin} disabled={joining || !code.trim()} className="rounded-lg bg-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700 disabled:opacity-50">Join</button>
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-neutral-500">Anyone can join this group using the code.</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 p-3 md:p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm text-neutral-400">Members</div>
              <div className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">{memberCount}</div>
            </div>

            {loading ? (
              <div className="py-2 text-sm text-neutral-400">Loading members…</div>
            ) : members.length === 0 ? (
              <div className="py-2 text-sm text-neutral-500">No members yet.</div>
            ) : (
              <ul className="space-y-2">
                {members.map(m => (
                  <li key={m.id} className="flex items-center justify-between rounded-lg bg-neutral-800 p-2">
                    <div className="flex items-center gap-3">
                      {m.avatarUrl ? (
                        <img src={m.avatarUrl} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-700"><UserIcon className="h-4 w-4 text-neutral-300" /></div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-white">{m.name?.trim() || m.phone || "User"}</div>
                        {m.bio && <div className="text-xs text-neutral-400">{m.bio}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {m.phone && (
                        <button onClick={()=>call(m)} className="rounded-lg bg-neutral-700 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-600">Call</button>
                      )}
                      <button onClick={()=>dm(m)} className="rounded-lg bg-yellow-500 px-2 py-1 text-xs font-medium text-black hover:bg-yellow-400">Message</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-white/10 p-3 md:p-4">
            <div className="mb-2 text-sm text-neutral-400">Add member by phone</div>
            <div className="flex gap-2">
              <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="+91 9XXXXXXXXX" className="flex-1 rounded-lg bg-neutral-800 px-3 py-2 text-white placeholder:text-neutral-500" />
              <button onClick={handleAdd} disabled={adding || !phone.trim()} className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400 disabled:opacity-50">{adding ? "Adding…" : "Add"}</button>
            </div>
            {error && <div className="mt-2 text-sm text-red-400">{error}</div>}
            <p className="mt-2 text-xs text-neutral-500">The phone must belong to an existing account.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
