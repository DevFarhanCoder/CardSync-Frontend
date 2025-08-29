// src/pages/Demo.tsx
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CheckCircle2, ShieldCheck, Zap, Sparkles } from 'lucide-react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

type DemoPayload = {
  firstName: string
  lastName: string
  email: string
  phone: string
  jobTitle?: string
  website?: string
  employees?: string
  users?: string
}

const EMPLOYEE_RANGES = [
  '1 – 10',
  '11 – 50',
  '51 – 200',
  '201 – 500',
  '501 – 1000',
  '1000+',
]

const USER_RANGES = ['1 – 5', '6 – 20', '21 – 100', '101 – 500', '501+']

export default function Demo() {
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data: DemoPayload = {
      firstName: (form.elements.namedItem('firstName') as HTMLInputElement).value.trim(),
      lastName: (form.elements.namedItem('lastName') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value.trim(),
      jobTitle: (form.elements.namedItem('jobTitle') as HTMLInputElement).value.trim(),
      website: (form.elements.namedItem('website') as HTMLInputElement).value.trim(),
      employees: (form.elements.namedItem('employees') as HTMLSelectElement).value,
      users: (form.elements.namedItem('users') as HTMLSelectElement).value,
    }

    if (!data.firstName || !data.lastName || !data.email || !data.phone) {
      alert('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 900)) // simulate send
    setSubmitting(false)
    setSent(true)
    form.reset()
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Navbar />

      {/* Hero / Demo teaser */}
      <section className="border-b border-[var(--border)] bg-[var(--bg)]">
        <div className="container py-16 md:py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="chip mb-4">
              <Sparkles size={16} className="text-[var(--gold)]" />
              <span>Live walkthrough • 25 minutes</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold">
              See <span className="text-[var(--gold)]">Instantlly-Cards</span> in action
            </h1>

            <p className="text-[var(--subtle)] mt-3 max-w-xl">
              We’ll tailor the demo to your use case—digital cards, team rollouts, analytics,
              CRM sync, and governance. Bring your questions!
            </p>

            <ul className="mt-6 space-y-3 text-[var(--subtle)]">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-400" size={18} />
                Templates, brand kits & actions
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="text-emerald-400" size={18} />
                SSO • SCIM • SOC2
              </li>
              <li className="flex items-center gap-3">
                <Zap className="text-emerald-400" size={18} />
                Real‑time analytics & lead capture
              </li>
            </ul>
          </div>

          {/* Right visual */}
          <div className="glass rounded-2xl p-6">
            <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
              <img
                src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200&auto=format&fit=crop"
                alt="Product demo"
                className="w-full h-72 md:h-96 object-cover"
                loading="lazy"
              />
            </div>
            <p className="text-sm text-[var(--subtle)] mt-3">
              A guided tour of creating, sharing, and tracking cards—plus admin controls for teams.
            </p>
          </div>
        </div>
      </section>

      {/* Demo form */}
      <main className="container py-14">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold">Get a Demo</h2>
          <p className="text-[var(--subtle)] mt-2">
            Tell us a little about your team and what you want to see—we’ll reach out with a
            time that works.
          </p>

          {sent && (
            <div className="mt-6 rounded-xl border border-emerald-700 bg-emerald-900/30 p-4 text-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} />
                <strong>Your request has been received.</strong>
              </div>
              <div className="text-sm opacity-90 mt-1">
                We’ll email you shortly to schedule a live walkthrough.
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">
                  First name<span className="text-rose-400">*</span>
                </label>
                <input
                  name="firstName"
                  required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  Last name<span className="text-rose-400">*</span>
                </label>
                <input
                  name="lastName"
                  required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">
                  Work email<span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Phone number<span className="text-rose-400">*</span>
                </label>
                <PhoneInput
                  country="in"
                  enableSearch
                  inputProps={{
                    name: 'phone',
                    required: true,
                    autoFocus: false,
                  }}
                  // Tailwind-friendly classes to match your theme
                  containerClass="w-full"
                  inputClass="!w-full !rounded-xl !border !border-[var(--border)] !bg-[var(--surface)] !px-3 !py-2 !text-[var(--text)] focus:!ring-2 focus:!ring-[var(--gold)]/30"
                  buttonClass="!border-[var(--border)] !bg-[var(--surface)]"
                  dropdownClass="!bg-[var(--surface)] !text-[var(--text)] !border !border-[var(--border)]"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Job title</label>
                <input
                  name="jobTitle"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Website URL</label>
                <input
                  name="website"
                  placeholder="https://"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Number of employees at company</label>
                <select
                  name="employees"
                  defaultValue=""
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                >
                  <option value="" disabled>
                    Please select
                  </option>
                  {EMPLOYEE_RANGES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Number of users</label>
                <select
                  name="users"
                  defaultValue=""
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                >
                  <option value="" disabled>
                    Please select
                  </option>
                  {USER_RANGES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* reCAPTCHA placeholder */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-[var(--subtle)] text-sm">
              This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of
              Service apply.
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-gold px-6 py-2 disabled:opacity-60"
              >
                {submitting ? 'Scheduling…' : 'Schedule Now'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
