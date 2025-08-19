const templates = Array.from({length: 8}).map((_,i)=>({ name: `Template ${i+1}`, tag: i%2 ? 'Minimal' : 'Luxe' }))

export default function Marketplace() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Templates Marketplace</h2>
        <input placeholder="Search templates..." className="rounded-xl bg-[var(--muted)] border border-[var(--border)] px-3 py-2"/>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        {templates.map((t,i)=>(
          <div key={i} className="card p-4">
            <div className="h-40 rounded-xl border border-[var(--border)] bg-gradient-to-br from-[var(--muted)] to-[rgba(212,175,55,0.15)]" />
            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{t.name}</div>
                <div className="text-xs text-[var(--subtle)]">{t.tag}</div>
              </div>
              <button className="btn btn-gold">Use</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
