import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type TItem = { name: string; role: string; city: string; avatar: string; quote: string }

const ITEMS: TItem[] = [
  {
    name: 'Tara Wilson',
    role: 'Head of Sales, Auraline',
    city: 'Austin, TX',
    avatar: 'https://ui-avatars.com/api/?name=Tara+Wilson&background=151A21&color=D4AF37',
    quote:
      'We replaced paper cards across 240 reps. CardSync’s QR + CRM sync increased captured leads by 31%.',
  },
  {
    name: 'Miguel Santos',
    role: 'Founder, Northwind',
    city: 'Lisbon, PT',
    avatar: 'https://ui-avatars.com/api/?name=Miguel+Santos&background=151A21&color=D4AF37',
    quote:
      'The Luxe templates look premium and our team can ship new cards in minutes—no designer needed.',
  },
  {
    name: 'Ritika Kapoor',
    role: 'Marketing Ops, BluePeak',
    city: 'Bengaluru, IN',
    avatar: 'https://ui-avatars.com/api/?name=Ritika+Kapoor&background=151A21&color=D4AF37',
    quote:
      'Real-time analytics and UTM links finally gave us attribution for events and booths.',
  },
]

export default function TestimonialCarousel() {
  const [idx, setIdx] = useState(0)
  const timer = useRef<number | null>(null)
  const next = () => setIdx((p) => (p + 1) % ITEMS.length)

  useEffect(() => {
    timer.current = window.setInterval(next, 4000)
    return () => { if (timer.current) window.clearInterval(timer.current) }
  }, [])

  return (
    <section className="container py-16">
      <h2 className="text-3xl font-semibold text-center">Loved by modern teams</h2>

      <div className="relative mt-8">
        <div className="mx-auto max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              className="magic-card"
              onMouseEnter={() => timer.current && window.clearInterval(timer.current!)}
              onMouseLeave={() => (timer.current = window.setInterval(next, 4000))}
            >
              <div className="inner p-6">
                <p className="text-xl leading-relaxed">“{ITEMS[idx].quote}”</p>
                <div className="mt-4 flex items-center gap-3">
                  <img className="h-10 w-10 rounded-full border border-[var(--gold)]" src={ITEMS[idx].avatar} />
                  <div>
                    <div className="text-sm font-medium">{ITEMS[idx].name}</div>
                    <div className="text-xs text-[var(--subtle)]">{ITEMS[idx].role} • {ITEMS[idx].city}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tiny dots */}
        <div className="mt-4 flex justify-center gap-2">
          {ITEMS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-2.5 w-2.5 rounded-full border border-[var(--gold)] ${i === idx ? 'bg-[var(--gold)]' : 'bg-transparent'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
