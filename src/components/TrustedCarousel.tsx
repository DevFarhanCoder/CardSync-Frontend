// src/components/TrustedCarousel.tsx
// Full-bleed, continuous logo carousel (2 rows, opposite directions)
// All brands use SimpleIcons (white logos) so every logo loads reliably.

import { useState } from 'react'

type Brand = { name: string; slug: string }

const BRANDS: Brand[] = [
  { name: 'Square', slug: 'square' },
  { name: 'Stripe', slug: 'stripe' },
  { name: 'Canva', slug: 'canva' },
  { name: 'Duolingo', slug: 'duolingo' },
  { name: 'ClickUp', slug: 'clickup' },
  { name: 'Intercom', slug: 'intercom' },
  { name: 'Google', slug: 'google' },
  { name: 'Airbnb', slug: 'airbnb' },
  { name: 'Snowflake', slug: 'snowflake' },
  // { name: 'Amazon', slug: 'amazon' },
  { name: 'Meta', slug: 'meta' },
  { name: 'Deloitte', slug: 'deloitte' },
  { name: 'Microsoft', slug: 'microsoft' },
  { name: 'PwC', slug: 'pwc' },
  { name: 'Adobe', slug: 'adobe' },
  // Replacements for unavailable logos:
  { name: 'Netflix', slug: 'netflix' },   // replaces UCLA
  { name: 'Spotify', slug: 'spotify' },   // replaces ABA
  { name: 'Uber', slug: 'uber' },         // replaces Cleveland Clinic
  { name: 'IBM', slug: 'ibm' },           // replaces Berkshire Hathaway
  { name: 'Marriott Bonvoy', slug: 'marriott' },
]

// SimpleIcons URL (monochrome white works great on dark)
const si = (slug: string) => `https://cdn.simpleicons.org/${slug}/ffffff`

/** Tiny SVG fallback (should rarely be used now, but keeps UI clean if any network hiccups) */
function fallbackBadge(name: string) {
  const initial = (name.trim()[0] || '•').toUpperCase()
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="140" height="56" viewBox="0 0 140 56">
      <rect x="0.5" y="0.5" width="139" height="55" rx="14" fill="#151A21" stroke="#2A3340" />
      <text x="24" y="34" font-family="Inter, ui-sans-serif" font-size="24" fill="#E7ECF3" font-weight="700">${initial}</text>
      <title>${name}</title>
    </svg>
  `.trim()
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function LogoImg({ brand }: { brand: Brand }) {
  const [src, setSrc] = useState(si(brand.slug))
  return (
    <img
      src={src}
      alt={brand.name}
      loading="lazy"
      className="h-[26px] block opacity-90 hover:opacity-100 transition"
      onError={() => setSrc(fallbackBadge(brand.name))}
    />
  )
}

function LogoChip({ brand }: { brand: Brand }) {
  return (
    <div className="logo-chip">
      <LogoImg brand={brand} />
    </div>
  )
}

function Track({ reverse = false }: { reverse?: boolean }) {
  const row = [...BRANDS, ...BRANDS] // duplicate for seamless loop
  return (
    <div
      className={`marquee gap-4 ${reverse ? '!animate-[marquee_30s_linear_infinite_reverse]' : ''}`}
      aria-hidden="true"
    >
      {row.map((b, i) => (
        <LogoChip brand={b} key={`${b.slug}-${i}`} />
      ))}
    </div>
  )
}

export default function TrustedCarousel() {
  return (
    <section className="py-14 full-bleed">
      <div className="mx-auto max-w-[1400px] px-4">
        <h3 className="text-center text-2xl md:text-3xl font-semibold">
          Over 2 Million Professionals Choose Instantlly-Cards
        </h3>
      </div>

      <div className="relative mt-8 edge-fade overflow-hidden">
        <div className="mx-auto max-w-[1600px] px-2">
          {/* Top row */}
          <Track />
          {/* Bottom row, opposite direction */}
          <div className="mt-6">
            <Track reverse />
          </div>
        </div>
      </div>
    </section>
  )
}
