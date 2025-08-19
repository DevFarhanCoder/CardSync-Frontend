export default function Support() {
  return (
    <div className="card p-6">
      <h3 className="font-semibold">Support</h3>
      <p className="text-[var(--subtle)] mt-1">Find quick answers or contact our team.</p>
      <div className="grid md:grid-cols-3 gap-3 mt-4">
        <div className="glass p-4 rounded-2xl">
          <div className="font-semibold">Docs</div>
          <p className="text-sm text-[var(--subtle)]">Guides and API</p>
        </div>
        <div className="glass p-4 rounded-2xl">
          <div className="font-semibold">Status</div>
          <p className="text-sm text-[var(--subtle)]">Uptime and incidents</p>
        </div>
        <div className="glass p-4 rounded-2xl">
          <div className="font-semibold">Contact</div>
          <p className="text-sm text-[var(--subtle)]">support@cardsync.app</p>
        </div>
      </div>
    </div>
  )
}
