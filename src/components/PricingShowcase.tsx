// src/components/PricingShowcase.tsx
// Compact, centered 4-card pricing grid with currency toggle (USD/INR)
// Logic added: gating plan CTAs behind auth (no design changes).

import { useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Check, User, TrendingUp, Crown, Rocket } from 'lucide-react'

type Money = { monthly: number | 'custom'; per?: string }
type Plan = {
  key: string
  name: string
  icon: React.ElementType
  strap: string
  usd: Money
  inr: Money
  commission?: string
  limit: string
  features: string[]
  featured?: boolean
  cta?: string
}

const PLANS: Plan[] = [
  {
    key: 'starter',
    name: 'Starter',
    icon: User,
    strap: 'Perfect for small businesses getting started',
    usd: { monthly: 0 },
    inr: { monthly: 0 },
    limit: 'Up to 5 deals/month',
    features: [
      'Up to 5 active listings',
      'Basic search & filters',
      'Direct messaging',
      'Email support',
      'Basic analytics',
      'Deal tracking',
    ],
    cta: 'Start Free',
  },
  {
    key: 'growth',
    name: 'Growth',
    icon: TrendingUp,
    strap: 'For growing businesses ready to scale',
    usd: { monthly: 8 },
    inr: { monthly: 2499 },
    commission: '+ 3% commission per deal',
    limit: 'Up to 15 deals/month',
    features: [
      'Up to 15 active listings',
      'Advanced search & filters',
      'Priority messaging',
      'Priority email support',
      'Advanced analytics dashboard',
      'Deal tracking & reporting',
      'Featured listings (3/month)',
    ],
    featured: true,
    cta: 'Subscribe Now',
  },
  {
    key: 'pro',
    name: 'Professional',
    icon: Crown,
    strap: 'For established businesses with high volume',
    usd: { monthly: 25 },
    inr: { monthly: 4999 },
    commission: '+ 3% commission per deal',
    limit: 'Up to 50 deals/month',
    features: [
      'Up to 50 active listings',
      'AI-powered matching',
      'Dedicated account manager',
      '24/7 priority support',
      'Custom analytics dashboard',
      'Premium verified badge',
      'Featured listings (10/month)',
      'API access',
    ],
    cta: 'Subscribe Now',
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    icon: Rocket,
    strap: 'Custom solutions for large organizations',
    usd: { monthly: 'custom' },
    inr: { monthly: 'custom' },
    commission: '+ 3% commission per deal',
    limit: 'Unlimited deals',
    features: [
      'Unlimited active listings',
      'Custom integrations',
      'White-label solutions',
      'Dedicated infrastructure',
      'Custom reporting suite',
      'Enterprise SLA',
      'Training & onboarding',
      'Custom contract terms',
    ],
    cta: 'Contact Sales',
  },
]

function Price({ money, currency }: { money: Money; currency: 'USD' | 'INR' }) {
  if (money.monthly === 'custom') return <span className="text-3xl font-bold">Custom</span>
  const n = money.monthly as number
  return (
    <span className="text-3xl font-bold text-[var(--gold)]">
      {currency === 'USD' ? `$${n}` : `₹${n.toLocaleString('en-IN')}`}
      <span className="text-base font-medium text-white/80"> {currency === 'USD' ? '/mo' : '/month'}</span>
    </span>
  )
}

function PlanCard({
  plan,
  currency,
  onSelect,
}: {
  plan: Plan
  currency: 'USD' | 'INR'
  onSelect: (key: string) => void
}) {
  const Icon = plan.icon
  const money = currency === 'USD' ? plan.usd : plan.inr
  const isFeatured = !!plan.featured

  return (
    <div
      className={`pricing-card h-full border bg-[var(--surface)] p-6 flex flex-col ${
        isFeatured ? 'border-[var(--gold)] ring-gold' : 'border-[var(--border)]'
      }`}
    >
      {isFeatured && <span className="badge-floating">★ Most Popular</span>}

      <div className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--muted)] border border-[var(--border)]">
        <Icon className="text-[var(--gold)]" size={18} />
      </div>

      <h3 className="mt-3 text-xl font-semibold">{plan.name}</h3>
      <p className="text-[var(--subtle)] text-sm">{plan.strap}</p>

      <div className="mt-5">
        <Price money={money} currency={currency} />
        {currency === 'INR' && plan.commission && (
          <div className="text-sm text-rose-400 mt-1">{plan.commission}</div>
        )}
        <div className="text-xs text-[var(--subtle)]">{plan.limit}</div>
      </div>

      <button
        onClick={() => onSelect(plan.key)}
        className={`mt-5 w-full rounded-xl px-4 py-2 font-medium ${
          isFeatured ? 'bg-white text-black' : 'btn btn-gold !w-full'
        }`}
      >
        {plan.cta || 'Choose Plan'}
      </button>

      <ul className="mt-5 space-y-2 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check size={16} className="text-emerald-400 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function PricingShowcase({ defaultCurrency = 'USD' }: { defaultCurrency?: 'USD' | 'INR' }) {
  const [currency, setCurrency] = useState<'USD' | 'INR'>(defaultCurrency)
  const { isAuthed } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Single handler used by all plan cards
  function handleSelect(planKey: string) {
    // enterprise → contact is not a checkout flow; keep as-is
    if (planKey === 'enterprise') {
      navigate('/contact')
      return
    }

    const isFree = planKey === 'starter'
    if (!isAuthed) {
      // Block pricing for guests and remember the intent
      const intent = isFree ? { type: 'start-free', planId: planKey } : { type: 'checkout', planId: planKey }
      navigate(isFree ? '/signup' : '/signin', { state: { from: location.pathname, intent } })
      return
    }

    // Authed path
    if (isFree) {
      navigate('/dashboard') // or onboarding route if you have one
    } else {
      navigate(`/dashboard/billing?plan=${encodeURIComponent(planKey)}`)
    }
  }

  const Toggle = useMemo(
    () => (
      <div className="mx-auto inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1">
        <button
          onClick={() => setCurrency('USD')}
          className={`px-4 py-1.5 rounded-full text-sm ${
            currency === 'USD' ? 'bg-[var(--muted)] text-white' : 'text-[var(--subtle)]'
          }`}
        >
          Global (USD)
        </button>
        <button
          onClick={() => setCurrency('INR')}
          className={`px-4 py-1.5 rounded-full text-sm ${
            currency === 'INR' ? 'bg-[var(--muted)] text-white' : 'text-[var(--subtle)]'
          }`}
        >
          India (INR)
        </button>
      </div>
    ),
    [currency]
  )

  return (
    <section className="py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          {Toggle}
          <h2 className="mt-6 text-3xl md:text-4xl font-bold">
            Transparent plans for individuals, teams, and enterprises
          </h2>
          <p className="mt-2 text-[var(--subtle)]">Centered, compact cards with all the details you need.</p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((p) => (
            <PlanCard key={p.key} plan={p} currency={currency} onSelect={handleSelect} />
          ))}
        </div>
      </div>
    </section>
  )
}
