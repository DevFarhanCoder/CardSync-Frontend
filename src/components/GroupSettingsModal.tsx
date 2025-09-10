// /src/components/GroupSettingsModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import { addMembersBulk, syncContacts, updateSettings, uploadGroupPhoto, type Group } from "@/lib/chatApi";

type Props = {
  open: boolean;
  onClose: () => void;
  group: Group | null;
  isAdmin: boolean;
  onChanged?: () => void;
};

type ContactLite = { name?: string; email?: string; phone?: string };

// GIS + People API – token flow
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
    const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "https://www.googleapis.com/auth/contacts.readonly",
      callback: (resp: any) => resp?.access_token ? resolve(resp.access_token) : reject(new Error("No access token")),
    });
    tokenClient.requestAccessToken();
  });
}


async function fetchGoogleContacts(token: string): Promise<ContactLite[]> {
  const url = "https://people.googleapis.com/v1/people/me/connections?pageSize=2000&personFields=names,emailAddresses,phoneNumbers";
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Failed to fetch Google contacts");
  const data = await res.json();
  const out: ContactLite[] = [];
  for (const p of data.connections || []) {
    const name = p.names?.[0]?.displayName || "";
    const email = p.emailAddresses?.[0]?.value || "";
    const phone = p.phoneNumbers?.[0]?.value || "";
    if (email || phone) out.push({ name, email, phone });
  }
  return out;
}

export default function GroupSettingsModal({ open, onClose, group, isAdmin, onChanged }: Props) {
  const [name, setName] = useState(group?.name || "");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<Array<{ userId: string; name: string; email: string; phone?: string }>>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setName(group?.name || "");
  }, [group?.id]);

  async function saveBasic() {
    if (!group) return;
    setSaving(true); setErr(null);
    try {
      await updateSettings(group.id, { name, description });
      onChanged && onChanged();
    } catch (e: any) { setErr(e.message || String(e)); }
    finally { setSaving(false); }
  }

  async function changePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    if (!group) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setErr(null);
    try {
      await uploadGroupPhoto(group.id, file);
      onChanged && onChanged();
    } catch (e: any) { setErr(e.message || String(e)); }
    finally { setUploading(false); }
  }

  async function importFromGoogle() {
    if (!group) return;
    setImporting(true); setErr(null);
    try {
      const token = await getGoogleAccessToken();
      const contacts = await fetchGoogleContacts(token);
      // Send to backend to match with existing app users
      const { matches } = await syncContacts(contacts);
      setImportResult(matches);
      setSelectedUserIds(matches.map(m => m.userId)); // pre-select
    } catch (e: any) { setErr(e.message || String(e)); }
    finally { setImporting(false); }
  }

  async function addSelectedToGroup() {
    if (!group) return;
    setSaving(true); setErr(null);
    try {
      const selectedPhones = importResult.filter(m => selectedUserIds.includes(m.userId)).map(m => m.phone).filter(Boolean) as string[];
      if (selectedPhones.length === 0) throw new Error("No phone numbers on selected contacts");
      await addMembersBulk(group.id, selectedPhones);
      onChanged && onChanged();
    } catch (e: any) { setErr(e.message || String(e)); }
    finally { setSaving(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title={""}>
      <div className="w-[92vw] max-w-2xl rounded-2xl bg-neutral-900 text-neutral-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h3 className="text-base font-semibold md:text-lg">Group settings</h3>
          <button onClick={onClose} className="rounded-full px-2 py-1 text-sm text-neutral-300 hover:bg-white/10">✕</button>
        </div>

        <div className="p-4 space-y-6">
          {/* Photo */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-neutral-800 grid place-items-center text-xs">Photo</div>
            <label className="cursor-pointer rounded-lg bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700">
              <input type="file" accept="image/*" className="hidden" onChange={changePhoto} disabled={!isAdmin || uploading} />
              {uploading ? "Uploading…" : "Change photo"}
            </label>
          </div>

          {/* Basic */}
          <div className="grid gap-3">
            <label className="text-sm text-neutral-400">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg bg-neutral-800 px-3 py-2 text-neutral-100" disabled={!isAdmin} />
            <label className="text-sm text-neutral-400">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-lg bg-neutral-800 px-3 py-2 text-neutral-100 min-h-[80px]" disabled={!isAdmin} />
            <button onClick={saveBasic} className="rounded-lg bg-yellow-400 px-4 py-2 font-medium text-black disabled:opacity-50 w-max" disabled={!isAdmin || saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>

          {/* Import */}
          <div className="rounded-xl border border-white/10 p-4">
            <div className="font-semibold mb-2">Add members from Google Contacts</div>
            <p className="text-xs text-neutral-400 mb-3">
              Only visible to group admins. We only show contacts who already have an account on this app (matched by phone/email).
            </p>
            <button onClick={importFromGoogle} className="rounded-lg bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700 disabled:opacity-50" disabled={!isAdmin || importing}>
              {importing ? "Loading contacts…" : "Load Google Contacts"}
            </button>

            {importResult.length > 0 && (
              <div className="mt-3 max-h-56 overflow-auto rounded-lg border border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-800 text-neutral-300">
                    <tr>
                      <th className="p-2 text-left">Add</th>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Phone</th>
                      <th className="p-2 text-left">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResult.map((m) => {
                      const checked = selectedUserIds.includes(m.userId);
                      return (
                        <tr key={m.userId} className="border-t border-white/10">
                          <td className="p-2">
                            <input type="checkbox" checked={checked} onChange={(e) => {
                              setSelectedUserIds((prev) => e.target.checked ? [...prev, m.userId] : prev.filter(id => id !== m.userId));
                            }} />
                          </td>
                          <td className="p-2">{m.name || "—"}</td>
                          <td className="p-2">{m.phone || "—"}</td>
                          <td className="p-2">{m.email || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {importResult.length > 0 && (
              <button onClick={addSelectedToGroup} className="mt-3 rounded-lg bg-yellow-400 px-4 py-2 font-medium text-black disabled:opacity-50" disabled={!isAdmin || saving || selectedUserIds.length === 0}>
                Add selected to group
              </button>
            )}
          </div>

          {err && <div className="text-sm text-red-400">{err}</div>}
        </div>
      </div>
    </Modal>
  );
}
