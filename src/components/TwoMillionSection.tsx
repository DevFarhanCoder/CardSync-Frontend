// src/components/TwoMillionSection.tsx
import { Users, Globe, Building2, Share2, Zap } from 'lucide-react'

type Stat = {
  icon: React.ElementType
  value: string
  label: string
  hint?: string
}

const STATS: Stat[] = [
  { icon: Users, value: '2M+', label: 'Professionals' },
  { icon: Building2, value: '75k+', label: 'Teams & Orgs' },
  { icon: Globe, value: '120+', label: 'Countries' },
  { icon: Share2, value: '1B+', label: 'Link / QR Shares' },
  { icon: Zap, value: '99.95%', label: 'Uptime', hint: 'last 12 months' },
]

export default function TwoMillionSection() {
  return (
    <section aria-labelledby="two-million" className="container my-16">
      <div className="text-center max-w-3xl mx-auto">
        <div className="chip mx-auto mb-4">
          <span className="text-[var(--subtle)]">Social proof</span>
        </div>

        <h2
          id="two-million"
          className="text-2xl md:text-3xl font-semibold tracking-tight"
        >
          Over <span className="text-[var(--gold)]">2 Million</span> Professionals Choose Instantlly-Cards
        </h2>

        <p className="mt-2 text-[var(--subtle)]">
          Enterprise-grade reliability with consumer-grade polish—trusted worldwide by
          individuals and teams who care about first impressions and measurable results.
        </p>
      </div>

      {/* Stats Grid (kept cards with background) */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {STATS.map(({ icon: Icon, value, label, hint }) => (
          <div
            key={label}
            className="flex flex-col items-center text-center rounded-xl bg-[var(--muted)] p-6"
          >
            <Icon size={26} className="text-[var(--gold)] mb-2" />
            <div className="text-xl font-semibold">{value}</div>
            <div className="text-sm text-[var(--subtle)]">
              {label} {hint && <span className="opacity-70">• {hint}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Trust badges */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <span className="chip">SSO &amp; SCIM</span>
        <span className="chip">SOC&nbsp;2</span>
        <span className="chip">GDPR-ready</span>
        <span className="chip">PWA + Offline</span>
        <span className="chip">CRM Sync</span>
      </div>
    </section>
  )
}
