export default function Testimonials() {
  const items = [
    {
      name: 'Tara Wilson',
      role: 'Head of Sales, Auraline',
      quote:
        'We replaced paper cards across 240 reps. CardSync’s QR + CRM sync increased captured leads by 31%.',
    },
    {
      name: 'Miguel Santos',
      role: 'Founder, Northwind',
      quote:
        'The Luxe templates look premium and our team can ship new cards in minutes—no designer needed.',
    },
    {
      name: 'Ritika Kapoor',
      role: 'Marketing Ops, BluePeak',
      quote:
        'Real-time analytics and UTM links finally gave us attribution for events and booths.',
    },
  ]
  return (
    <section className="container py-16">
      <h2 className="text-3xl font-semibold text-center">Loved by modern teams</h2>
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {items.map((t, i) => (
          <div key={i} className="glass rounded-2xl p-6">
            <p className="text-lg">“{t.quote}”</p>
            <div className="mt-4 text-sm text-[var(--subtle)]">
              — {t.name}, {t.role}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
