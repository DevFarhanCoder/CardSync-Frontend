import React, { useEffect, useMemo, useState } from "react";
import { X, Crown, Phone, MessageSquare, Copy, Settings, LogOut, User as UserIcon } from "lucide-react";
import {
    fetchGroupMembers, removeMember, toggleAdmin, addMemberByPhone,
    updateSettings, uploadGroupPhoto, syncContacts, addMembersBulk,
    leaveGroup, type Group, type UserLite
} from "@/lib/chatApi";
import { openDirect } from "@/lib/userApi";
import { useNavigate } from "react-router-dom";

type Props = { open: boolean; onClose: () => void; group: Group | null; };
type Tab = "details" | "settings";

async function getGoogleAccessToken(): Promise<string> {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
    if (!clientId) throw new Error("VITE_GOOGLE_CLIENT_ID is not set");
    await new Promise<void>((resolve, reject) => {
        if (window.google && (window as any).google.accounts?.oauth2) return resolve();
        const s = document.createElement("script");
        s.src = "https://accounts.google.com/gsi/client";
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load Google Identity Services"));
        document.head.appendChild(s);
    });
    return await new Promise<string>((resolve, reject) => {
        const tc = (window as any).google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: "https://www.googleapis.com/auth/contacts.readonly",
            callback: (resp: any) => resp?.access_token ? resolve(resp.access_token) : reject(new Error("No access token")),
        });
        tc.requestAccessToken();
    });
}

async function fetchGoogleContacts(token: string) {
    const url = "https://people.googleapis.com/v1/people/me/connections?pageSize=2000&personFields=names,emailAddresses,phoneNumbers";
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Failed to fetch Google contacts");
    const data = await res.json();
    const out: Array<{ name?: string; email?: string; phone?: string }> = [];
    for (const p of data.connections || []) {
        const name = p.names?.[0]?.displayName || "";
        const email = p.emailAddresses?.[0]?.value || "";
        const phone = p.phoneNumbers?.[0]?.value || "";
        if (email || phone) out.push({ name, email, phone });
    }
    return out;
}

export default function GroupRightPanel({ open, onClose, group }: Props) {
    const nav = useNavigate();
    const [tab, setTab] = useState<Tab>("details");

    const [members, setMembers] = useState<UserLite[]>([]);
    const [ownerId, setOwnerId] = useState<string>("");
    const [admins, setAdmins] = useState<string[]>([]);
    const [viewerId, setViewerId] = useState<string>("");
    const [viewerIsOwner, setViewerIsOwner] = useState<boolean>(false);
    const [code, setCode] = useState(group?.joinCode || "");

    const [phone, setPhone] = useState("");
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState(group?.name || "");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<Array<{ userId: string; name: string; email: string; phone?: string }>>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [activeMemberId, setActiveMemberId] = useState<string | null>(null);

    useEffect(() => {
        if (!open || !group?.id) return;
        (async () => {
            const data = await fetchGroupMembers(group.id);
            setViewerId(data.viewerId);
            setViewerIsOwner(!!data.viewerIsOwner);
            setOwnerId(data.ownerId);
            setAdmins((data.admins || []).map(String));
            setMembers(data.members || []);
            if (data.joinCode) setCode(data.joinCode);
            setName(data.name);
            setDescription(data.description || "");
        })();
    }, [open, group?.id]);

    // 🔒 show admin controls only if user is member + admin/owner
    const isMember = useMemo(
        () => members.some(m => String(m.id) === String(viewerId)),
        [members, viewerId]
    );
    const viewerIsAdmin = isMember && (viewerIsOwner || admins.includes(String(viewerId)));

    const sortedMembers = useMemo(() => {
        const meFirst = (a: UserLite, b: UserLite) =>
            (String(a.id) === String(viewerId) ? -1 : String(b.id) === String(viewerId) ? 1 : 0);
        const byName = (a: UserLite, b: UserLite) => (a.name || "").localeCompare(b.name || "");
        return [...members].sort((a, b) => meFirst(a, b) || byName(a, b));
    }, [members, viewerId]);

    async function refresh() {
        if (!group) return;
        const data = await fetchGroupMembers(group.id);
        setViewerId(data.viewerId);
        setViewerIsOwner(!!data.viewerIsOwner);
        setOwnerId(data.ownerId);
        setAdmins((data.admins || []).map(String));
        setMembers(data.members || []);
    }

    async function handleAdd() {
        if (!group) return;
        setAdding(true); setError(null);
        try {
            const p = phone.replace(/[^\d+]/g, "");
            if (!p) throw new Error("Invalid phone");
            await addMemberByPhone(group.id, p);
            setPhone("");
            await refresh();
        } catch (e: any) { setError(e.message || String(e)); }
        finally { setAdding(false); }
    }

    async function makeAdmin(userId: string, make: boolean) {
        if (!group) return;
        await toggleAdmin(group.id, userId, make);
        await refresh();
    }

    async function remove(userId: string) {
        if (!group) return;
        await removeMember(group.id, userId);
        await refresh();
    }

    async function changePhoto(e: React.ChangeEvent<HTMLInputElement>) {
        if (!group) return;
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            await uploadGroupPhoto(group.id, file);
            await refresh();
        } finally { setUploading(false); }
    }

    async function saveBasic() {
        if (!group) return;
        setSaving(true);
        try {
            await updateSettings(group.id, { name, description });
        } finally { setSaving(false); }
    }

    async function importFromGoogle() {
        if (!group) return;
        setImporting(true);
        try {
            const token = await getGoogleAccessToken();
            const contacts = await fetchGoogleContacts(token);
            const { matches } = await syncContacts(contacts);
            setImportResult(matches);
            setSelectedUserIds(matches.map(m => m.userId));
            setTab("settings");
        } finally { setImporting(false); }
    }

    async function addSelectedToGroup() {
        if (!group) return;
        setSaving(true);
        try {
            const phones = importResult
                .filter(m => selectedUserIds.includes(m.userId))
                .map(m => m.phone)
                .filter(Boolean) as string[];
            await addMembersBulk(group.id, phones);
            await refresh();
        } finally { setSaving(false); }
    }

    async function doLeave() {
        if (!group) return;
        await leaveGroup(group.id);
        onClose();
        window.location.reload();
    }

    function MemberRow({ m }: { m: UserLite }) {
        const isOwnerHere = String(m.id) === String(ownerId);
        const isAdminHere = isOwnerHere || admins.includes(String(m.id));
        const isSelf = String(m.id) === String(viewerId);
        const open = activeMemberId === String(m.id);

        return (
            <li className="py-2">
                {/* Row click reveals actions */}
                <button
                    className="w-full text-left"
                    onClick={() => setActiveMemberId(open ? null : String(m.id))}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-neutral-800 grid place-items-center text-xs">
                            <UserIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="truncate">{m.name || m.email || m.phone || "User"}</span>
                                {isOwnerHere && <span className="rounded-full bg-yellow-400/20 px-2 py-0.5 text-[10px] text-yellow-400">OWNER</span>}
                                {!isOwnerHere && isAdminHere && <span className="rounded-full bg-blue-400/20 px-2 py-0.5 text-[10px] text-blue-400">ADMIN</span>}
                            </div>
                            <div className="text-xs text-neutral-400 truncate">
                                {[m.email, m.phone].filter(Boolean).join(" • ") || "—"}
                            </div>
                        </div>
                    </div>
                </button>

                {open && (
                    <div className="mt-2 ml-11 grid gap-2">
                        {isSelf ? (
                            <button
                                className="w-max rounded-lg bg-neutral-800 px-3 py-1.5 text-xs hover:bg-neutral-700"
                                onClick={() => nav("/dashboard/profile")}
                            >
                                My profile
                            </button>
                        ) : (
                            <>
                                <button
                                    className="w-max rounded-lg bg-neutral-800 px-3 py-1.5 text-xs hover:bg-neutral-700 flex items-center gap-2"
                                    onClick={async () => { const { id } = await openDirect(m.id); nav(`/dashboard/dm/${id}`); }}
                                >
                                    <MessageSquare className="h-3 w-3" /> Message {m.name?.split(" ")[0] || ""}
                                </button>
                                {m.phone && (
                                    <a className="w-max rounded-lg bg-neutral-800 px-3 py-1.5 text-xs hover:bg-neutral-700 flex items-center gap-2" href={`tel:${m.phone}`}>
                                        <Phone className="h-3 w-3" /> Call {m.name?.split(" ")[0] || ""}
                                    </a>
                                )}
                                <button
                                    className="w-max rounded-lg bg-neutral-800 px-3 py-1.5 text-xs hover:bg-neutral-700"
                                    onClick={() => nav(`/dashboard/user/${m.id}`)}
                                >
                                    View profile
                                </button>
                            </>
                        )}

                        {/* Admin-only controls (never shown to non-admin viewers) */}
                        {viewerIsAdmin && !isSelf && !isOwnerHere && (
                            <div className="mt-1 flex gap-2">
                                <button
                                    className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs hover:bg-neutral-700 flex items-center gap-1"
                                    onClick={() => makeAdmin(m.id, !isAdminHere)}
                                >
                                    <Crown className="h-3 w-3" />{isAdminHere ? "Remove admin" : "Make admin"}
                                </button>
                                <button
                                    className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/30"
                                    onClick={() => remove(m.id)}
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </li>
        );
    }

    return (
        <div className={`fixed inset-y-0 right-0 z-50 transform ${open ? "translate-x-0" : "translate-x-full"} transition-transform duration-200 md:w-[380px] w-full bg-neutral-900 text-neutral-100 shadow-2xl`}>
            <div className="flex items-center justify-between border-b border-white/10 p-3">
                <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-neutral-300" />
                    <div className="font-semibold text-sm">{group?.name || "Group"}</div>
                </div>
                <button onClick={onClose} className="rounded-full p-1 hover:bg-white/10"><X className="h-5 w-5" /></button>
            </div>

            <div className="flex border-b border-white/10 text-sm">
                <button onClick={() => setTab("details")} className={`flex-1 p-2 ${tab === "details" ? "bg-neutral-800" : ""}`}>Details</button>
                <button onClick={() => setTab("settings")} className={`flex-1 p-2 ${tab === "settings" ? "bg-neutral-800" : ""}`}>Settings</button>
            </div>

            {tab === "details" ? (
                <div className="p-3 space-y-4 overflow-auto h-[calc(100%-96px)]">
                    <div>
                        <div className="mb-1 text-xs text-neutral-400">Join code</div>
                        <div className="flex gap-2">
                            <input readOnly value={group?.joinCode || code || ""} className="flex-1 rounded-lg bg-neutral-800 px-3 py-2 font-mono" />
                            <button onClick={() => navigator.clipboard.writeText(group?.joinCode || code || "")} className="rounded-lg bg-neutral-800 px-3 py-2 text-sm flex items-center gap-1"><Copy className="h-4 w-4" />Copy</button>
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 text-xs text-neutral-400">Members</div>
                        <ul className="divide-y divide-white/10">
                            {sortedMembers.map((m) => <MemberRow key={m.id} m={m} />)}
                        </ul>
                    </div>

                    {/* Leave group for non-owners only */}
                    {isMember && !viewerIsOwner && (
                        <div className="pt-2">
                            <button onClick={doLeave} className="flex items-center gap-2 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-300 hover:bg-red-500/30">
                                <LogOut className="h-4 w-4" /> Leave group
                            </button>
                        </div>
                    )}

                    {/* Admin-only block */}
                    {viewerIsAdmin && (
                        <div className="rounded-xl border border-white/10 p-3">
                            <div className="mb-2 text-xs text-neutral-400">Add member by phone</div>
                            <div className="flex gap-2">
                                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9XXXXXXXXX" className="flex-1 rounded-lg bg-neutral-800 px-3 py-2" />
                                <button onClick={handleAdd} disabled={adding || !phone.trim()} className="rounded-lg bg-yellow-400 px-3 py-2 text-black text-sm">{adding ? "Adding…" : "Add"}</button>
                            </div>
                            {error && <div className="mt-2 text-xs text-red-400">{error}</div>}
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-3 space-y-4 overflow-auto h-[calc(100%-96px)]">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-neutral-800 grid place-items-center text-xs">Photo</div>
                        {viewerIsAdmin && (
                            <label className="cursor-pointer rounded-lg bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700">
                                <input type="file" accept="image/*" className="hidden" onChange={changePhoto} disabled={uploading} />
                                {uploading ? "Uploading…" : "Change photo"}
                            </label>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <label className="text-xs text-neutral-400">Name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg bg-neutral-800 px-3 py-2" disabled={!viewerIsAdmin} />
                        <label className="text-xs text-neutral-400">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-lg bg-neutral-800 px-3 py-2 min-h-[72px]" disabled={!viewerIsAdmin} />
                        {viewerIsAdmin && (
                            <button onClick={saveBasic} className="w-max rounded-lg bg-yellow-400 px-4 py-2 text-black text-sm disabled:opacity-50" disabled={saving}>
                                {saving ? "Saving…" : "Save"}
                            </button>
                        )}
                    </div>

                    {viewerIsAdmin && (
                        <div className="rounded-xl border border-white/10 p-3">
                            <div className="mb-1 font-semibold text-sm">Add from Google Contacts</div>
                            <p className="text-xs text-neutral-400 mb-2">Only admins. We show contacts that already have an account.</p>
                            <button onClick={importFromGoogle} disabled={importing} className="rounded-lg bg-neutral-800 px-3 py-2 text-sm">
                                {importing ? "Loading…" : "Load Google Contacts"}
                            </button>

                            {importResult.length > 0 && (
                                <>
                                    <div className="mt-3 max-h-48 overflow-auto rounded-lg border border-white/10">
                                        <table className="w-full text-xs">
                                            <thead className="bg-neutral-800 text-neutral-300">
                                                <tr><th className="p-2 text-left">Add</th><th className="p-2 text-left">Name</th><th className="p-2 text-left">Phone</th><th className="p-2 text-left">Email</th></tr>
                                            </thead>
                                            <tbody>
                                                {importResult.map(m => {
                                                    const checked = selectedUserIds.includes(m.userId);
                                                    return (
                                                        <tr key={m.userId} className="border-t border-white/10">
                                                            <td className="p-2"><input type="checkbox" checked={checked} onChange={(e) => setSelectedUserIds(prev => e.target.checked ? [...prev, m.userId] : prev.filter(id => id !== m.userId))} /></td>
                                                            <td className="p-2">{m.name || "—"}</td>
                                                            <td className="p-2">{m.phone || "—"}</td>
                                                            <td className="p-2">{m.email || "—"}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <button onClick={addSelectedToGroup} className="mt-2 rounded-lg bg-yellow-400 px-4 py-2 text-black text-sm">Add selected</button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
