const members = [
  { name: 'John Carter', role: 'Owner' },
  { name: 'Sarah Johnson', role: 'Sales' },
  { name: 'Michael Lee', role: 'Marketing' },
]

export default function Team() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Team</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {members.map((m,i)=>(
          <div key={i} className="card p-5 flex items-center gap-4">
            <img className="h-12 w-12 rounded-full border border-[var(--gold)]" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=151A21&color=D4AF37`} />
            <div>
              <div className="font-semibold">{m.name}</div>
              <div className="text-xs text-[var(--subtle)]">{m.role}</div>
            </div>
            <button className="ml-auto btn btn-outline">Manage</button>
          </div>
        ))}
      </div>
    </div>
  )
}
