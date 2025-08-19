export default function LogoCloud() {
  const logos = ['Acme', 'Globex', 'Innotech', 'BluePeak', 'Auraline', 'Northwind', 'Stellar', 'OmniCorp']
  return (
    <section className="container py-12 opacity-90">
      <p className="text-center text-sm text-[var(--subtle)] mb-6">Trusted by teams at</p>
      <div className="grid grid-cols-2 md:grid-cols-8 gap-4 place-items-center">
        {logos.map((l, i) => (
          <div
            key={i}
            className="text-[var(--subtle)]/80 text-sm border border-[var(--border)] rounded-xl px-3 py-2 w-full text-center"
          >
            {l}
          </div>
        ))}
      </div>
    </section>
  )
}
