export default function Billing() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card p-6">
        <h3 className="font-semibold">Plan</h3>
        <p className="text-[var(--subtle)] mt-1">You are on <span className="text-white font-medium">Pro</span> plan.</p>
        <button className="btn btn-gold mt-4">Upgrade</button>
      </div>
      <div className="card p-6">
        <h3 className="font-semibold">Invoices</h3>
        <ul className="mt-3 text-sm text-[var(--subtle)] space-y-2">
          <li>INV-0001 — $8 — Jan 2025</li>
          <li>INV-0002 — $8 — Feb 2025</li>
          <li>INV-0003 — $8 — Mar 2025</li>
        </ul>
      </div>
    </div>
  )
}
