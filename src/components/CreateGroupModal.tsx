import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { createGroup } from "@/lib/chatApi";

export default function CreateGroupModal({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setLoading(true); setErr(null);
    try {
      await createGroup(name.trim());
      onClose();
      window.location.reload();
    } catch (e: any) { setErr(e.message || String(e)); }
    finally { setLoading(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title={""}>
      <div className="w-[92vw] max-w-sm rounded-2xl bg-neutral-900 p-4 text-neutral-100">
        <div className="mb-3 text-sm font-semibold">Create new group</div>
        <input className="w-full rounded-lg bg-neutral-800 px-3 py-2" placeholder="Group name" value={name} onChange={e=>setName(e.target.value)} />
        {err && <div className="mt-2 text-xs text-red-400">{err}</div>}
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm hover:bg-white/10">Cancel</button>
          <button onClick={submit} disabled={!name.trim() || loading} className="rounded-lg bg-yellow-400 px-3 py-2 text-sm text-black">{loading?"Creating…":"Create"}</button>
        </div>
      </div>
    </Modal>
  );
}
