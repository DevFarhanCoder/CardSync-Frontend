import { Check, Minus } from 'lucide-react'

type Row = {
  label: string
  free?: boolean | string
  pro?: boolean | string
  team?: boolean | string
  enterprise?: boolean | string
}

const ROWS: Row[] = [
  { label: 'Cards per user', free: '1', pro: 'Unlimited', team: 'Unlimited', enterprise: 'Unlimited' },
  { label: 'Analytics (views, clicks)', free: true, pro: true, team: 'Advanced', enterprise: 'Enterprise' },
  { label: 'Lead capture forms', free: false, pro: true, team: true, enterprise: true },
  { label: 'UTM tracking', free: false, pro: true, team: true, enterprise: true },
  { label: 'CRM sync (HubSpot, Salesforce, Notion, Google)', free: false, pro: true, team: true, enterprise: true },
  { label: 'AI profile assistant', free: false, pro: true, team: true, enterprise: true },
  { label: 'Team roles & SSO/SCIM', free: false, pro: false, team: true, enterprise: true },
  { label: 'Template locking / brand kits', free: false, pro: true, team: true, enterprise: true },
  { label: 'Dedicated infra / VPC / DPA', free: false, pro: false, team: false, enterprise: true },
  { label: 'SLA & priority support', free: false, pro: 'Business hours', team: 'Priority', enterprise: '24×7' },
]

function Cell({ v }: { v: Row[keyof Row] }) {
  if (typeof v === 'string') return <span className="text-sm">{v}</span>
  if (v) return <Check className="text-emerald-400" size={18} />
  return <Minus className="text-[var(--subtle)]" size={18} />
}

export default function ComparePlans() {
  return (
    <section id="compare" className="border-t border-[var(--border)] bg-[var(--bg)]">
      <div className="container py-14 md:py-18">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">Compare Plans</h2>
          <p className="text-[var(--subtle)] mt-2">Feature‑by‑feature breakdown across Free, Pro, Team, and Enterprise.</p>
        </div>

        {/* Responsive overflow */}
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="min-w-[900px] w-full text-left">
            <thead>
              <tr className="text-sm">
                <th className="px-5 py-4 text-[var(--subtle)] font-semibold">Feature</th>
                <th className="px-5 py-4">Free</th>
                <th className="px-5 py-4">Pro</th>
                <th className="px-5 py-4">Team</th>
                <th className="px-5 py-4">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={r.label} className={i % 2 ? 'bg-[rgba(255,255,255,0.03)]' : ''}>
                  <td className="px-5 py-4">{r.label}</td>
                  <td className="px-5 py-4"><Cell v={r.free} /></td>
                  <td className="px-5 py-4"><Cell v={r.pro} /></td>
                  <td className="px-5 py-4"><Cell v={r.team} /></td>
                  <td className="px-5 py-4"><Cell v={r.enterprise} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
