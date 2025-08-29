import { useState } from 'react'
import { CalendarClock, Mail, Phone, ShieldCheck } from 'lucide-react'

type FormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  jobTitle: string
  website: string
  employees: string
  users: string
  agree: boolean
}

const COUNTRIES = ['India (भारत)', 'United States', 'United Kingdom', 'Singapore', 'UAE']
const EMPLOYEE_RANGES = ['1–10', '11–50', '51–200', '201–1000', '1000+']
const USER_RANGES = ['1–5', '6–25', '26–100', '101–500', '500+']

export default function PricingDemoForm() {
  const [data, setData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'India (भारत)',
    jobTitle: '',
    website: '',
    employees: '',
    users: '',
    agree: true,
  })
  const [submitting, setSubmitting] = useState(false)

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    // Replace with your API later
    console.table(data)
    await new Promise(r => setTimeout(r, 700))
    setSubmitting(false)
    alert('✅ Thanks! We’ll reach out to schedule your demo.')
  }

  const inputCls =
    'w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 outline-none ring-0 focus:border-[var(--gold)] transition'

  const labelCls = 'text-sm font-medium mb-1'

  return (
    <section id="demo" className="border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="container py-14 md:py-18">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <div className="chip mx-auto mb-3">
              <CalendarClock size={16} className="text-[var(--gold)]" />
              <span>Get a live demo</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Get a Demo</h2>
            <p className="text-[var(--subtle)] mt-2">
              See Instantlly-Cards in action—lead capture, analytics, CRM sync, and governance controls.
            </p>
          </div>

          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>First name<span className="text-rose-400">*</span></label>
                <input className={inputCls} value={data.firstName} onChange={e => update('firstName', e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Last name</label>
                <input className={inputCls} value={data.lastName} onChange={e => update('lastName', e.target.value)} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Work email<span className="text-rose-400">*</span></label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-[var(--subtle)]" />
                  <input
                    type="email"
                    className={`${inputCls} pl-9`}
                    placeholder="you@company.com"
                    value={data.email}
                    onChange={e => update('email', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Phone number<span className="text-rose-400">*</span></label>
                <div className="grid grid-cols-[1fr,1.5fr] gap-2">
                  <select className={inputCls} value={data.country} onChange={e => update('country', e.target.value)}>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-3 text-[var(--subtle)]" />
                    <input
                      className={`${inputCls} pl-9`}
                      placeholder="+91 98765 43210"
                      value={data.phone}
                      onChange={e => update('phone', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Job title</label>
              <input className={inputCls} value={data.jobTitle} onChange={e => update('jobTitle', e.target.value)} />
            </div>

            <div>
              <label className={labelCls}>Website URL</label>
              <input className={inputCls} placeholder="https://yourcompany.com" value={data.website} onChange={e => update('website', e.target.value)} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Number of employees at company<span className="text-rose-400">*</span></label>
                <select className={inputCls} value={data.employees} onChange={e => update('employees', e.target.value)} required>
                  <option value="">Please select</option>
                  {EMPLOYEE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Number of users<span className="text-rose-400">*</span></label>
                <select className={inputCls} value={data.users} onChange={e => update('users', e.target.value)} required>
                  <option value="">Please select</option>
                  {USER_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* Recaptcha placeholder box */}
            <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-[var(--subtle)] text-sm">
              <ShieldCheck size={16} className="inline-block mr-2 text-emerald-400" />
              Protected by reCAPTCHA — we’ll never share your data.
            </div>

            <div className="flex items-center gap-2">
              <input id="agree" type="checkbox" checked={data.agree} onChange={e => update('agree', e.target.checked)} className="h-4 w-4 rounded border-[var(--border)] bg-[var(--surface)]" />
              <label htmlFor="agree" className="text-sm text-[var(--subtle)]">
                I agree to be contacted about the demo and Instantlly-Cards updates.
              </label>
            </div>

            <div className="pt-1">
              <button disabled={submitting} className="btn btn-gold px-5 py-2.5 disabled:opacity-60">
                {submitting ? 'Scheduling…' : 'Schedule Now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
