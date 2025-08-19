// src/components/PlanGridLong.tsx
import { useMemo, useState } from 'react'
import { Check, Users, Crown, Rocket, TrendingUp } from 'lucide-react'

type Money = { monthly: number | 'custom'; per?: string }
type Plan = {
  key: 'free' | 'pro' | 'team' | 'enterprise'
  name: string
  strap: string
  icon: React.ElementType
  usd: Money
  inr: Money
  commission?: string
  limit: string
  bullets: string[]
  long: string
  featured?: boolean
}

const PLANS: Plan[] = [
  {
    key: 'free',
    name: 'Free',
    strap: 'For getting started with digital business cards',
    icon: Users,
    usd: { monthly: 0 },
    inr: { monthly: 0 },
    limit: '1 card, basic analytics',
    bullets: [
      '1 card with QR sharing',
      'Basic analytics (views, clicks)',
      'Personal links & contact actions',
      'Community support',
    ],
    long:
      'Everything you need to launch a professional digital card. Great for testing CardSync and sharing with friends or colleagues before you scale.',
  },
  {
    key: 'pro',
    name: 'Pro',
    strap: 'For individuals who want more reach and polish',
    icon: TrendingUp,
    usd: { monthly: 8 },
    inr: { monthly: 2499 },
    commission: '+ 3% commission per deal',
    limit: 'Unlimited cards',
    bullets: [
      'Unlimited cards & themes',
      'Advanced analytics & UTM tracking',
      'AI profile assistant & follow‑ups',
      'CRM sync (HubSpot, Salesforce, Notion, Google Contacts)',
      'Custom domains & brand kits',
    ],
    long:
      'Grow your personal brand with unlimited premium cards, better tracking, and CRM sync. Ideal for consultants, creators, and small teams who want measurable results.',
    featured: true,
  },
  {
    key: 'team',
    name: 'Team',
    strap: 'For teams who need control, governance, and speed',
    icon: Crown,
    usd: { monthly: 6, per: '/user/mo' },
    inr: { monthly: 4999 },
    commission: '+ 3% commission per deal',
    limit: 'Team controls',
    bullets: [
      'SSO & SCIM user provisioning',
      'Brand kits, template locking & asset control',
      'Org & team dashboards, CSV export',
      'Priority support with SLA options',
    ],
    long:
      'Roll out consistent, on‑brand cards across your company. Lock templates, manage roles, and track performance by team or event with exportable reports.',
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    strap: 'For organizations with custom security and scale',
    icon: Rocket,
    usd: { monthly: 'custom' },
    inr: { monthly: 'custom' },
    commission: '+ 3% commission per deal',
    limit: 'Unlimited seats & cards',
    bullets: [
      'Dedicated infrastructure & VPC/region options',
      'Custom integrations & SSO/SCIM',
      'Audit logs, DPA, enterprise SLA',
      'White‑label & custom contract terms',
    ],
    long:
      'Security, control, and support tailored to your environment. From deployment playbooks to custom analytics, our team partners with you to deliver measurable value.',
  },
]

function Price({
  money,
  currency,
  featured,
  per,
}: {
  money: Money
  currency: 'USD' | 'INR'
  featured?: boolean
  per?: string
}) {
  if (money.monthly === 'custom') {
    return (
      <div className={`text-3xl md:text-4xl font-bold ${featured ? 'text-[var(--gold)]' : ''}`}>
        Custom
      </div>
    )
  }
  const value = money.monthly as number
  const label =
    currency === 'USD'
      ? `$${value}${per ?? ' /mo'}`
      : `₹${value.toLocaleString('en-IN')}${per ? ` ${per}` : ' /month'}`
  return (
    <div className={`text-3xl md:text-4xl font-bold ${featured ? 'text-[var(--gold)]' : ''}`}>
      {label}
    </div>
  )
}

export default function PlanGridLong({
  defaultCurrency = 'USD',
}: {
  defaultCurrency?: 'USD' | 'INR'
}) {
  const [currency, setCurrency] = useState<'USD' | 'INR'>(defaultCurrency)

  const CurrencyToggle = useMemo(
    () => (
      <div
        className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-1"
        role="tablist"
        aria-label="Currency toggle"
      >
        <button
          role="tab"
          aria-selected={currency === 'USD'}
          className={`px-4 py-1.5 rounded-full text-sm ${
            currency === 'USD' ? 'bg-[var(--muted)] text-white' : 'text-[var(--subtle)]'
          }`}
          onClick={() => setCurrency('USD')}
        >
          Global (USD)
        </button>
        <button
          role="tab"
          aria-selected={currency === 'INR'}
          className={`px-4 py-1.5 rounded-full text-sm ${
            currency === 'INR' ? 'bg-[var(--muted)] text-white' : 'text-[var(--subtle)]'
          }`}
          onClick={() => setCurrency('INR')}
        >
          India (INR)
        </button>
      </div>
    ),
    [currency]
  )

  return (
    <section className="py-14">
      {/* Centered, comfortable width so long cards don't feel oversized */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          {CurrencyToggle}
          <h2 className="mt-6 text-3xl md:text-4xl font-bold">
            Transparent plans for individuals, teams, and enterprises
          </h2>
          <p className="mt-2 text-[var(--subtle)]">
            One elegant design, two currencies. Choose the plan that fits—pricing updates automatically.
          </p>
        </div>

        {/* 2 long cards per row (desktop), stacked on mobile */}
        <div className="mt-10 grid gap-6 md:gap-7 md:grid-cols-2">
          {PLANS.map((p) => {
            const Icon = p.icon
            const money = currency === 'USD' ? p.usd : p.inr
            const per = currency === 'USD' && p.usd.per ? p.usd.per : undefined

            return (
              <article
                key={p.key}
                className={`pricing-card relative border bg-[var(--surface)] rounded-2xl p-6 md:p-7 ${
                  p.featured ? 'border-[var(--gold)] ring-gold' : 'border-[var(--border)]'
                }`}
              >
                {p.featured && <span className="badge-floating">★ Most Popular</span>}

                <div className="flex items-start gap-5">
                  <div className="grid h-12 w-12 md:h-14 md:w-14 place-items-center rounded-xl md:rounded-2xl bg-[var(--muted)] border border-[var(--border)] shrink-0">
                    <Icon className="text-[var(--gold)]" size={20} />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <div>
                        <h3 className="text-xl md:text-2xl font-semibold">{p.name}</h3>
                        <p className="text-[var(--subtle)]">{p.strap}</p>
                      </div>
                      <Price money={money} currency={currency} featured={p.featured} per={per} />
                    </div>

                    {/* meta line under price */}
                    <div className="mt-1 text-sm">
                      {currency === 'INR' && p.commission ? (
                        <span className="text-rose-400">{p.commission}</span>
                      ) : null}
                      <span className="ml-2 text-[var(--subtle)]">{p.limit}</span>
                    </div>

                    {/* Long description */}
                    <p className="mt-4 text-[var(--subtle)] leading-relaxed">{p.long}</p>

                    {/* CTA */}
                    <div className="mt-5">
                      <button
                        className={`rounded-xl px-5 py-2.5 font-medium ${
                          p.featured ? 'bg-white text-black' : 'btn btn-gold'
                        }`}
                        aria-label={`${p.name} plan – ${
                          p.key === 'free' ? 'Start Free' : p.key === 'enterprise' ? 'Contact Sales' : 'Subscribe Now'
                        }`}
                      >
                        {p.key === 'free'
                          ? 'Start Free'
                          : p.key === 'enterprise'
                          ? 'Contact Sales'
                          : 'Subscribe Now'}
                      </button>
                    </div>

                    {/* Checklist */}
                    <ul className="mt-5 grid sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                      {p.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2">
                          <Check size={16} className="text-emerald-400 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
