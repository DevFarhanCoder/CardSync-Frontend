// src/components/Navbar.tsx
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

type NavItem = { label: string; href: string }
const LINKS: NavItem[] = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Demo', href: '/demo' }, 
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [elevated, setElevated] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Subtle elevation on scroll
  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock background scroll when mobile menu open
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    return () => { document.documentElement.style.overflow = '' }
  }, [open])

  // Centralized nav handler: routes vs. hash scrolling
  const handleGo = (href: string) => {
    setOpen(false)

    const go = () => {
      const isHashOnly = href.startsWith('#')
      if (isHashOnly) {
        const id = href.replace('#', '')
        if (location.pathname === '/') {
          // Smooth scroll on the landing page
          const el = document.getElementById(id)
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          else navigate(`/#${id}`) // fallback
        } else {
          // Navigate home then scroll (hash in URL)
          navigate(`/#${id}`)
        }
        return
      }

      // Normal route navigation
      navigate(href)
    }

    // tiny delay so the sheet animates closed before route/scroll
    setTimeout(go, 120)
  }

  // Desktop link renderer (button for hashes, Link for routes)
  const DesktopLink = ({ item }: { item: NavItem }) => {
    if (item.href.startsWith('#')) {
      return (
        <button
          onClick={() => handleGo(item.href)}
          className="text-[var(--subtle)] hover:text-white transition"
        >
          {item.label}
        </button>
      )
    }
    return (
      <Link
        to={item.href}
        className="text-[var(--subtle)] hover:text-white transition"
      >
        {item.label}
      </Link>
    )
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow ${
        elevated ? 'shadow-[0_8px_40px_rgba(0,0,0,.35)]' : ''
      }`}
    >
      <div className="backdrop-blur-xl bg-[rgba(15,18,22,.72)] border-b border-[var(--border)]">
        <nav className="container flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--gold)] text-sm font-semibold">
              CS
            </span>
            <span className="text-lg font-semibold">CardSync</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {LINKS.map((l) => (
              <DesktopLink key={l.label} item={l} />
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/signin" className="text-[var(--subtle)] hover:text-white transition">
              Sign in
            </Link>
            <Link to="/get-started" className="btn btn-gold px-4 py-2">
              Get Started
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>
        </nav>
      </div>

      {/* ===== Mobile sheet ===== */}
      <div
        className={`md:hidden fixed inset-0 z-[60] ${
          open ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setOpen(false)}
        />

        {/* Panel */}
        <div
          className={`
            absolute left-0 right-0 top-0
            border-b border-[var(--border)]
            bg-[rgba(15,18,22,.95)] backdrop-blur-xl
            shadow-[0_16px_60px_rgba(0,0,0,.45)]
            transition-transform duration-300 ease-out
            ${open ? 'translate-y-0' : '-translate-y-full'}
          `}
          role="dialog"
          aria-modal="true"
        >
          <div className="container pt-3 pb-6">
            {/* Bar with close + brand */}
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--gold)] text-sm font-semibold">
                  CS
                </span>
                <span className="text-lg font-semibold">CardSync</span>
              </div>
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Links */}
            <div className="mt-3 divide-y divide-[var(--border)]">
              {LINKS.map((l) => (
                <button
                  key={l.label}
                  onClick={() => handleGo(l.href)}
                  className="w-full text-left px-2 py-3 text-base text-[var(--text)] hover:bg-white/5 rounded-lg transition"
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => handleGo('/signin')}
                className="btn btn-outline w-full justify-center py-2.5"
              >
                Sign in
              </button>
              <button
                onClick={() => handleGo('/get-started')}
                className="btn btn-gold w-full justify-center py-2.5"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
