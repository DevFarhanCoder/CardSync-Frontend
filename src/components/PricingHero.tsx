import { CreditCard, ShieldCheck, Star } from 'lucide-react'

function PricingIllustration() {
  return (
    <svg
      viewBox="0 0 620 520"
      className="w-full h-[360px] md:h-[420px] drop-shadow-[0_30px_80px_rgba(212,175,55,0.08)]"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="g" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="rgba(212,175,55,.18)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="620" height="520" fill="url(#g)" />

      {/* Phone body */}
      <g transform="translate(180,50)">
        <rect
          x="0" y="0" rx="28" ry="28"
          width="260" height="420"
          fill="var(--surface)"
          stroke="var(--border)" strokeWidth="2"
        />
        <rect x="72" y="18" width="116" height="8" rx="4" fill="var(--muted)" />
        <rect x="18" y="40" width="224" height="362" rx="16" fill="#0D1217" />

        {/* Header */}
        <rect x="34" y="58" width="120" height="14" rx="7" fill="var(--muted)" />
        <rect x="34" y="82" width="180" height="10" rx="6" fill="var(--muted)" opacity=".6" />

        {/* List rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <g key={i} transform={`translate(34, ${112 + i * 50})`}>
            <rect width="36" height="36" rx="9" fill="var(--muted)" />
            <rect x="48" y="6" width="140" height="8" rx="4" fill="var(--muted)" opacity=".9" />
            <rect x="48" y="20" width="110" height="8" rx="4" fill="var(--muted)" opacity=".55" />
            <rect x="170" y="8" width="28" height="20" rx="10" fill="var(--gold)" opacity=".22" />
          </g>
        ))}

        {/* CTA button */}
        <rect x="60" y="328" width="140" height="36" rx="18" fill="var(--gold)" opacity=".9" />
        <text x="130" y="352" textAnchor="middle" fill="#0b0e12" fontWeight="700" fontSize="14">
          Pay Now
        </text>
      </g>

      {/* Paper planes / coins */}
      <g transform="translate(420,210) rotate(10)">
        <path d="M0 18 L160 0 L72 46 L64 80 Z" fill="var(--muted)" />
        <circle cx="106" cy="30" r="22" fill="var(--gold)" />
        <path d="M98 32 h16 M106 24 v16" stroke="#0d1116" strokeWidth="2.5" />
      </g>

      <g transform="translate(420,350) rotate(-12)">
        <path d="M0 18 L130 0 L56 38 L50 66 Z" fill="var(--muted)" />
        <circle cx="88" cy="24" r="16" fill="var(--gold)" />
        <path d="M82 26 h12 M88 20 v12" stroke="#0d1116" strokeWidth="2.3" />
      </g>
    </svg>
  )
}

export default function PricingHero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="container grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
        {/* Left copy (keep previous text) */}
        <div>
          <div className="chip mb-4">
            <CreditCard size={16} className="text-[var(--gold)]" />
            <span>Transparent plans for individuals, teams, and enterprises</span>
          </div>

          <h1 className="text-4xl leading-tight font-bold md:text-5xl">
            Pricing that scales with <span className="text-[var(--gold)]">your growth</span>
          </h1>

          <p className="mt-4 text-[var(--subtle)] max-w-xl">
            Centered, compact cards with all the details you need. Plans designed to fit
            individuals, growing teams, and enterprises — with the flexibility to scale when you do.
          </p>

          {/* Trust row */}
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="text-[var(--gold)]" size={18} fill="currentColor" />
              ))}
            </div>
            <span className="text-sm text-[var(--subtle)]">Rated 4.9/5 by 2,000+ professionals</span>
            <span className="inline-flex items-center gap-2 text-sm text-[var(--subtle)]">
              <ShieldCheck size={16} className="text-emerald-400" />
              SSO • SCIM • SOC2
            </span>
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a className="btn btn-gold px-5 py-2.5" href="/get-started">Start Free Trial</a>
            <a className="btn btn-outline px-5 py-2.5" href="/contact">View Demo</a>
          </div>
        </div>

        {/* Right side – new illustration */}
        <div className="relative">
          <PricingIllustration />
        </div>
      </div>
    </section>
  )
}
