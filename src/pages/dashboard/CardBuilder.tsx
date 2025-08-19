export default function CardBuilder() {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="card p-6 lg:col-span-2 min-h-[500px]">
        <h3 className="font-semibold">Canvas</h3>
        <div className="mt-3 grid place-items-center h-[420px] border border-[var(--border)] rounded-xl bg-[var(--muted)] text-[var(--subtle)]">
          Live preview
        </div>
      </div>
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold">Properties</h3>
        <div>
          <label className="text-sm">Title</label>
          <input className="mt-1 w-full rounded-xl bg-[var(--muted)] border border-[var(--border)] px-3 py-2" placeholder="Card Title"/>
        </div>
        <div>
          <label className="text-sm">Theme</label>
          <select className="mt-1 w-full rounded-xl bg-[var(--muted)] border border-[var(--border)] px-3 py-2">
            <option>Luxe (Black/Gold)</option>
            <option>Minimal (Light)</option>
            <option>Tech (Indigo)</option>
          </select>
        </div>
        <button className="btn btn-gold w-full">Save</button>
      </div>
    </div>
  )
}
