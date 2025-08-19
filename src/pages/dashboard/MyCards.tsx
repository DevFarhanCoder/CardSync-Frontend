import { Link } from 'react-router-dom'

const cards = [
  { id: '1', name: 'Professional', status: 'Active', last: '2h ago' },
  { id: '2', name: 'Networking', status: 'Draft', last: '1d ago' },
  { id: '3', name: 'Conference 2025', status: 'Active', last: '3d ago' },
]

export default function MyCards() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">My Cards</h2>
        <Link to="/dashboard/builder" className="btn btn-gold">Create New</Link>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.id} className="card p-5">
            <div className="h-40 rounded-xl bg-gradient-to-br from-[var(--muted)] to-[rgba(212,175,55,0.15)] border border-[var(--border)]" />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{c.name}</h4>
                <p className="text-xs text-[var(--subtle)]">Updated {c.last}</p>
              </div>
              <span className="chip">{c.status}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn btn-outline flex-1">Share</button>
              <button className="btn btn-gold flex-1">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
