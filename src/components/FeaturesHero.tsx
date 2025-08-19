// src/components/FeaturesHero.tsx
import {
  Star,
  ShieldCheck,
  Sparkles,
  Share2,
  QrCode,
  Link as LinkIcon,
  UserPlus,
  Eye,
} from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'

type PhoneCardProps = {
  img: string
  name: string
  title: string
  className?: string
}

/* --- Small badges (optional) --- */
const AppStoreBadge = () => (
  <a
    href="#"
    className="inline-flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 hover:brightness-110 transition"
    aria-label="Download on the App Store"
  >
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="opacity-90">
      <path d="M19.665 16.341c-.372.857-.815 1.64-1.338 2.35-.704.95-1.255 1.604-1.654 1.963-.662.61-1.374.923-2.137.942-.545.0-1.202-.155-1.973-.466-.772-.311-1.481-.466-2.13-.466-.671 0-1.397.155-2.178.466-.781.311-1.41.473-1.887.486-.743.032-1.465-.292-2.165-.972-.46-.391-1.026-1.086-1.7-2.086-.73-1.07-1.328-2.318-1.793-3.742-.503-1.57-.755-3.086-.755-4.547 0-1.681.362-3.148 1.087-4.403C1.843 4.103 2.65 3.222 3.54 2.7c.91-.534 1.873-.811 2.89-.833.569-.011 1.314.16 2.234.514.921.354 1.511.536 1.77.546.177 0 .792-.205 1.847-.614 1.004-.383 1.852-.542 2.544-.478 1.882.152 3.291.902 4.228 2.248-1.68 1.017-2.513 2.44-2.499 4.27.014 1.423.53 2.607 1.546 3.553.458.432.971.764 1.539.996-.123.355-.259.703-.41 1.044z"/>
      <path d="M15.86 1.184c0 .518-.188 1.067-.562 1.648-.455.68-1.001 1.148-1.637 1.401-.244.095-.54.153-.888.175-.004-.6.164-1.182.504-1.746.34-.565.79-1.018 1.351-1.359.57-.35 1.112-.54 1.627-.571.009.151.013.299.013.452z"/>
    </svg>
    <div className="text-left leading-tight">
      <div className="text-xs text-[var(--subtle)]">Download on the</div>
      <div className="text-sm font-semibold">App Store</div>
    </div>
  </a>
)

const PlayBadge = () => (
  <a
    href="#"
    className="inline-flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 hover:brightness-110 transition"
    aria-label="Get it on Google Play"
  >
    <svg width="22" height="22" viewBox="0 0 512 512" className="opacity-90">
      <path fill="currentColor" d="M325.3 234.3 93.4 2.4C86.1-4.9 75.5-0.6 75.5 9.5V502.5c0 10.1 10.6 14.4 17.9 7.1l231.9-231.9c9.8-9.8 9.8-25.7 0-35.4z"/>
      <path fill="currentColor" d="m402.7 167.8-60.4 36.1-46.1-46.1 31-31c9.8-9.8 25.7-9.8 35.4 0l40.1 40.1z"/>
      <path fill="currentColor" d="m402.7 344.2-40.1 40.1c-9.8 9.8-25.7 9.8-35.4 0l-31-31 46.1-46.1 60.4 36.1z"/>
    </svg>
    <div className="text-left leading-tight">
      <div className="text-xs text-[var(--subtle)]">GET IT ON</div>
      <div className="text-sm font-semibold">Google Play</div>
    </div>
  </a>
)

/* --- Phone card with a FIXED action sheet (no hover) --- */
function PhoneCard({ img, name, title, className }: PhoneCardProps) {
  return (
    <div
      className={`relative rounded-[2.2rem] border border-[var(--border)] bg-[var(--surface)] shadow-soft p-3 ${className || ''}`}
    >
      {/* Screen */}
      <div className="relative rounded-2xl overflow-hidden bg-[var(--muted)]">
        <img
          alt={name}
          src={img}
          className="w-full h-[380px] object-cover opacity-95"
          loading="lazy"
        />

        {/* Action sheet – ALWAYS visible */}
        <div
          className="
            absolute left-2 right-2 bottom-2
            rounded-xl border border-[var(--border)] bg-[rgba(15,18,22,0.78)]
            backdrop-blur-md p-2
          "
          aria-label="Quick actions"
        >
          <div className="grid grid-cols-5 gap-2">
            <button className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 hover:bg-[rgba(255,255,255,0.06)] transition">
              <Share2 size={18} className="text-[var(--gold)]" />
              <span className="text-[10px] text-[var(--subtle)]">Share</span>
            </button>
            <button className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 hover:bg-[rgba(255,255,255,0.06)] transition">
              <QrCode size={18} className="text-[var(--gold)]" />
              <span className="text-[10px] text-[var(--subtle)]">QR</span>
            </button>
            <button className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 hover:bg-[rgba(255,255,255,0.06)] transition">
              <LinkIcon size={18} className="text-[var(--gold)]" />
              <span className="text-[10px] text-[var(--subtle)]">Copy</span>
            </button>
            <button className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 hover:bg-[rgba(255,255,255,0.06)] transition">
              <UserPlus size={18} className="text-[var(--gold)]" />
              <span className="text-[10px] text-[var(--subtle)]">Save</span>
            </button>
            <button className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 hover:bg-[rgba(255,255,255,0.06)] transition">
              <Eye size={18} className="text-[var(--gold)]" />
              <span className="text-[10px] text-[var(--subtle)]">Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="mt-3 text-center">
        <div className="font-semibold">{name}</div>
        <div className="text-xs text-[var(--subtle)]">{title}</div>
      </div>
    </div>
  )
}

export default function FeaturesHero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="container grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
        {/* Left copy */}
        <div>
          <div className="chip mb-4">
            <Sparkles size={16} className="text-[var(--gold)]" />
            <span>Modern features for teams</span>
          </div>

          <h1 className="text-4xl leading-tight font-bold md:text-5xl">
            The #1 <span className="text-[var(--gold)]">Digital Card</span> Platform for Pros
          </h1>

          <p className="mt-4 text-[var(--subtle)] max-w-xl">
            Create stunning digital business cards, share with a tap, and track every interaction.
            Enterprise security, CRM sync, and a premium design system—built for scale.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="text-[var(--gold)]" size={18} fill="currentColor" />
              ))}
            </div>
            <span className="text-sm text-[var(--subtle)]">
              Rated 4.9/5 by 2,000+ professionals
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-[var(--subtle)]">
              <ShieldCheck size={16} className="text-emerald-400" />
              SSO • SCIM • SOC2
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <RouterLink className="btn btn-gold px-5 py-2.5" to="/get-started">Get Started</RouterLink>
            <RouterLink className="btn btn-outline px-5 py-2.5" to="/pricing">See Pricing</RouterLink>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <AppStoreBadge />
            <PlayBadge />
          </div>
        </div>

        {/* Right – phone stack with fixed action sheets */}
        <div className="relative h-[520px] md:h-[560px]">
          {/* Left phone */}
          <div className="absolute left-0 top-6 w-[260px] md:w-[300px] rotate-[-6deg]">
            <PhoneCard
              img="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=640&auto=format&fit=crop"
              name="Sophia Kub"
              title="Marketing Director"
            />
          </div>

          {/* Right phone – Tanvi Dixit */}
          <div className="absolute right-0 bottom-0 w-[260px] md:w-[300px] rotate-[7deg]">
            <PhoneCard
              img="https://viralmean.com/wp-content/uploads/2024/12/image-7204627-1408x1536.jpg"  // put the uploaded photo at /public/images/tanvi-dixit.png
              name="Tanvi Dixit"
              title="Creative Designer"
            />
          </div>

          {/* subtle glow */}
          <div
            className="pointer-events-none absolute inset-0 -z-10 blur-3xl opacity-30"
            style={{
              background:
                'radial-gradient(600px 220px at 60% 40%, rgba(212,175,55,.18), transparent 60%)',
            }}
          />
        </div>
      </div>
    </section>
  )
}
