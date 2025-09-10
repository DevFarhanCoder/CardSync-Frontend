// /src/components/GroupDetailsModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  addMemberByPhone,
  fetchGroupMembers,
  joinByCode,
  removeMember,
  toggleAdmin,
  type Group,
  type UserLite,
} from "@/lib/chatApi";
import { Phone, MessageSquare, User as UserIcon, Crown, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUserId } from "@/utils/getUserId";

type Props = { open: boolean; onClose: () => void; group: Group | null; currentUser?: any };

const cleanPhone = (s: string) => s.replace(/[^\d+]/g, "");

export default function GroupDetailsModal({ open, onClose, group, currentUser }: Props) {
  const nav = useNavigate();
  const uid = getUserId(currentUser);
  const [members, setMembers] = useState<UserLite[]>([]);
  const [ownerId, setOwnerId] = useState<string>("");
  const [admins, setAdmins] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [adding, setAdding] = useState(false);
  const [joining, setJoining] = useState(false);
  const [code, setCode] = useState(group?.joinCode || "");
  const [error, setError] = useState<string | null>(null);

  const isOwner = ownerId && uid && String(ownerId) === String(uid);
  const isAdmin = isOwner || admins.includes(String(uid));
  const memberCount = members.length;

  useEffect(() => {
    if (!open || !group?.id) return;
    (async () => {
      const data = await fetchGroupMembers(group.id);
      setOwnerId(data.ownerId);
      setAdmins(data.admins || []);
      setMembers(data.members || []);
      if (data.joinCode) setCode(data.joinCode);
    })();
  }, [open, group?.id]);

  const sortedMembers = useMemo(() => {
    const meFirst = (a: UserLite, b: UserLite) => (String(a.id) === String(uid) ? -1 : String(b.id) === String(uid) ? 1 : 0);
    const byName = (a: UserLite, b: UserLite) => (a.name || "").localeCompare(b.name || "");
    return [...members].sort((a, b) => meFirst(a, b) || byName(a, b));
  }, [members, uid]);

  async function handleAdd() {
    if (!group) return;
    setAdding(true); setError(null);
    try {
      const p = cleanPhone(phone);
      if (!p) throw new Error("Invalid phone");
      await addMemberByPhone(group.id, p);
      setPhone(""); // clear
      const data = await fetchGroupMembers(group.id);
      setMembers(data.members || []);
      setAdmins(data.admins || []);
    } catch (e: any) { setError(e.message || String(e)); }
    finally { setAdding(false); }
  }

  async function doJoin() {
    if (!code.trim()) return;
    setJoining(true); setError(null);
    try {
      await joinByCode(code.trim());
      onClose();
    } catch (e: any) { setError(e.message || String(e)); }
    finally { setJoining(false); }
  }

  async function makeAdmin(userId: string, make: boolean) {
    if (!group) return;
    try {
      await toggleAdmin(group.id, userId, make);
      const data = await fetchGroupMembers(group.id);
      setMembers(data.members || []);
      setAdmins(data.admins || []);
    } catch (e) {}
  }

  async function remove(userId: string) {
    if (!group) return;
    try {
      await removeMember(group.id, userId);
      const data = await fetchGroupMembers(group.id);
      setMembers(data.members || []);
      setAdmins(data.admins || []);
    } catch (e) {}
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? "block" : "hidden"}`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-neutral-900 text-neutral-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h3 className="text-base font-semibold text-white md:text-lg">Group details</h3>
          <button onClick={onClose} className="rounded-full px-2 py-1 text-sm text-neutral-300 hover:bg-white/10">✕</button>
        </div>

        {/* Join code / Join by code */}
        <div className="mb-4 rounded-xl border border-white/10 p-3 md:p-4">
          <div className="mb-1 text-sm text-neutral-400">Join code</div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input value={group?.joinCode || ""} readOnly className="flex-1 rounded-lg bg-neutral-800 px-3 py-2 text-center font-mono text-white" />
            <button onClick={() => navigator.clipboard.writeText(group?.joinCode || "")} className="flex items-center gap-2 rounded-lg bg-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700">
              <Copy className="h-4 w-4" /> Copy
            </button>
            <div className="ml-auto flex-1 sm:ml-4">
              <div className="flex gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" className="flex-1 rounded-lg bg-neutral-800 px-3 py-2 text-white placeholder:text-neutral-500" />
                <button onClick={doJoin} disabled={joining || !code.trim()} className="rounded-lg bg-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700 disabled:opacity-50">
                  Join
                </button>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-500">Only members/owner can view this page.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Members */}
          <div className="rounded-xl border border-white/10 p-3 md:p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm text-neutral-400">Members</div>
              <div className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">{memberCount}</div>
            </div>
            {sortedMembers.length === 0 ? (
              <div className="text-sm text-neutral-400">No members found.</div>
            ) : (
              <ul className="divide-y divide-white/10">
                {sortedMembers.map((m) => {
                  const isOwnerHere = String(m.id) === String(ownerId);
                  const isAdminHere = isOwnerHere || !!m.isAdmin || admins.includes(String(m.id));
                  return (
                    <li key={m.id} className="flex items-center gap-3 py-2">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-neutral-800"><UserIcon className="h-4 w-4"/></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-neutral-100">{m.name || m.email || m.phone || "User"}</span>
                          {isOwnerHere && <span className="rounded-full bg-yellow-400/20 px-2 py-0.5 text-[10px] text-yellow-400">OWNER</span>}
                          {!isOwnerHere && isAdminHere && <span className="rounded-full bg-blue-400/20 px-2 py-0.5 text-[10px] text-blue-400">ADMIN</span>}
                        </div>
                        <div className="text-xs text-neutral-400">{[m.email, m.phone].filter(Boolean).join(" • ") || "—"}</div>
                      </div>
                      {/* Quick actions */}
                      <button className="chip" onClick={() => nav(`/dashboard/chat/direct/${m.id}`)} title="Message">
                        <MessageSquare className="h-4 w-4"/>
                      </button>
                      {m.phone && (
                        <a className="chip" href={`tel:${m.phone}`} title="Call">
                          <Phone className="h-4 w-4"/>
                        </a>
                      )}
                      {/* Admin controls visible to admins */}
                      {isAdmin && !isOwnerHere && (
                        <>
                          <button className="chip" onClick={() => makeAdmin(m.id, !isAdminHere)} title={isAdminHere ? "Remove admin" : "Make admin"}>
                            <Crown className="h-4 w-4"/>
                          </button>
                          <button className="chip" onClick={() => remove(m.id)} title="Remove">✕</button>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Add by phone — only for admin */}
          <div className="rounded-xl border border-white/10 p-3 md:p-4">
            <div className="mb-2 text-sm text-neutral-400">Add member by phone</div>
            {isAdmin ? (
              <>
                <div className="flex gap-2">
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9XXXXXXXXX"
                         className="flex-1 rounded-lg bg-neutral-800 px-3 py-2 text-white placeholder:text-neutral-500" />
                  <button onClick={handleAdd} disabled={adding || !phone.trim()}
                          className="rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-black hover:bg-yellow-400 disabled:opacity-50">
                    {adding ? "Adding…" : "Add"}
                  </button>
                </div>
                {error && <div className="mt-2 text-sm text-red-400">{error}</div>}
                <p className="mt-2 text-xs text-neutral-500">The phone must belong to an existing account.</p>
              </>
            ) : (
              <p className="text-sm text-neutral-400">Only group admins can add members.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
