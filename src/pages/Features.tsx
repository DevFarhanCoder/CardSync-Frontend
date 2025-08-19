import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FeaturesHero from '@/components/FeaturesHero'
import {
  CreditCard, LineChart, BookUser, Shield, Share2, QrCode, Layers, Cpu
} from 'lucide-react'

const ICONS = [CreditCard, LineChart, BookUser, Shield, Share2, QrCode, Layers, Cpu]

const sections = [
  {
    title: 'Card Builder', desc: 'Drag‑and‑drop editor with brand kits, templates, and instant mobile preview.',
    bullets: ['50+ templates', 'Custom fonts & themes', 'Actions: call, email, map, links, files', 'NFC & QR ready']
  },
  {
    title: 'Analytics', desc: 'Track profile views, link clicks, shares, and conversions with UTM support.',
    bullets: ['Funnels & attribution', 'Org/Team dashboards', 'Export as CSV', 'Realtime feed']
  },
  {
    title: 'Contacts CRM', desc: 'Unified contact book with enrichment, notes, reminders, and stage pipelines.',
    bullets: ['Import/Export', 'Tags & segments', 'Smart dedupe', 'Reminders']
  },
  {
    title: 'Enterprise', desc: 'SSO, SCIM, brand controls, and mass provisioning for large organizations.',
    bullets: ['Okta, Google Workspace', 'SCIM user sync', 'Audit logs', 'Custom domains']
  },
  {
    title: 'Security & Compliance', desc: 'Private by default with robust controls and region-aware storage.',
    bullets: ['Granular visibility', 'PII redaction', 'Encryption at rest & transit', 'GDPR-ready consent']
  },
  {
    title: 'Distribution', desc: 'Deploy at scale for events & teams with automated naming & assets.',
    bullets: ['Bulk import', 'Template locking', 'Auto QR/NFC payloads', 'Print-ready exports']
  },
  {
    title: 'Integrations', desc: 'Plug into your stack to boost workflows & attribution.',
    bullets: ['HubSpot & Salesforce', 'Slack & Zapier', 'Google Contacts', 'Notion exports']
  },
  {
    title: 'AI Assistant', desc: 'Generate bios, taglines, follow-up emails and suggestions.',
    bullets: ['Tone presets', 'Auto-summarize leads', 'Follow-up cadences', 'Smart recommendations']
  },
]

export default function Features() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      {/* New hero section */}
      <FeaturesHero />
      <section className="container py-16">
        <h1 className="text-4xl font-bold text-center">Features that feel premium</h1>
        <p className="text-[var(--subtle)] mt-2 text-center max-w-3xl mx-auto">
          Built for professionals and enterprise teams—designed for speed, polish, and measurable outcomes.
        </p>

        <div className="mt-10 grid md:grid-cols-2 gap-8">
          {sections.map((s, i) => {
            const Icon = ICONS[i % ICONS.length]
            return (
              <div key={i} className="magic-card hover:shadow-soft transition">
                <div className="inner p-8">
                  <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-[var(--muted)] border border-[var(--border)]">
                    <Icon className="text-[var(--gold)]" size={18} />
                  </div>
                  <h3 className="text-2xl font-semibold">{s.title}</h3>
                  <p className="text-[var(--subtle)] mt-1">{s.desc}</p>
                  <ul className="mt-4 grid gap-2 text-sm">
                    {s.bullets.map((b, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" /> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        {/* Mini spotlight */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {['Real-time preview', 'Drag blocks', 'One-click QR/NFC'].map((t, i) => (
            <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
              <div className="mx-auto h-40 rounded-xl bg-gradient-to-br from-[var(--muted)] to-[rgba(212,175,55,0.15)] border border-[var(--border)]" />
              <div className="mt-3 font-semibold">{t}</div>
              <div className="text-sm text-[var(--subtle)]">Clean, fast, and mobile-perfect.</div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  )
}
