import { motion } from 'framer-motion'
import { PencilRuler, SlidersHorizontal, Share2, LineChart, Sparkles } from 'lucide-react'

const STEPS = [
  { title: 'Create', desc: 'Pick a template & brand kit.', Icon: PencilRuler },
  { title: 'Customize', desc: 'Add actions: call, email, links, files.', Icon: SlidersHorizontal },
  { title: 'Share', desc: 'NFC tap, QR scan, or deep link.', Icon: Share2 },
  { title: 'Track', desc: 'Views, clicks, saves, conversions.', Icon: LineChart },
  { title: 'Convert', desc: 'Sync to CRM & follow-up.', Icon: Sparkles },
]

export default function FlowChart() {
  return (
    <section className="container py-14">
      <h3 className="text-center text-2xl md:text-3xl font-semibold">How Instantlly-Cards Flows from Hello → Customer</h3>

      <div className="relative mt-10 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        {/* SVG connectors */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="g" x1="0" x2="1">
              <stop offset="0%" stopColor="rgba(212,175,55,0.2)" />
              <stop offset="100%" stopColor="rgba(212,175,55,0.5)" />
            </linearGradient>
          </defs>
          {/* 4 lines between 5 nodes */}
          {[0,1,2,3].map(i => (
            <line key={i} className="flow-line" x1={`${(i+0.5)*20}%`} y1="60%" x2={`${(i+1.5)*20}%`} y2="60%" stroke="url(#g)" />
          ))}
        </svg>

        <div className="grid grid-cols-5 gap-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.06 }}
              className="magic-card"
            >
              <div className="inner p-5 text-center">
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-[var(--muted)] border border-[var(--border)] flow-pulse">
                  <s.Icon className="text-[var(--gold)]" size={20} />
                </div>
                <div className="font-semibold">{i + 1}. {s.title}</div>
                <p className="mt-1 text-sm text-[var(--subtle)]">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
