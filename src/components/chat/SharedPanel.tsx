export default function SharedPanel({
  open, onClose,
}: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[190]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-[520px] border-l border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="font-semibold">Details</div>
          <button className="text-zinc-400" onClick={onClose}>✕</button>
        </div>
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <button className="rounded-lg bg-zinc-800 px-3 py-2 text-sm">Media</button>
            <button className="rounded-lg bg-zinc-800 px-3 py-2 text-sm">Docs</button>
            <button className="rounded-lg bg-zinc-800 px-3 py-2 text-sm">Links</button>
          </div>
          {/* TODO: render actual items from API */}
          <div className="text-sm text-zinc-400">No shared items yet.</div>
        </div>
      </aside>
    </div>
  );
}
