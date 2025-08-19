import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type QA = { q: string; a: string }
export default function FAQ({ items, title = 'Frequently asked questions' }: { items: QA[]; title?: string }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="container py-16">
      <h2 className="text-3xl font-semibold text-center">{title}</h2>
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        {items.map((it, i) => (
          <div key={i} className="magic-card">
            <button
              className="inner w-full text-left p-5 flex items-center justify-between"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="font-semibold">{it.q}</span>
              <ChevronDown className={`transition ${open === i ? 'rotate-180 text-[var(--gold)]' : 'opacity-60'}`} />
            </button>
            {open === i && (
              <div className="inner p-5 pt-0 text-[var(--subtle)] -mt-4 rounded-t-none">
                {it.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
