// src/components/Navbar.tsx
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

type NavItem = { label: string; href: string }
const LINKS: NavItem[] = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Demo', href: '/demo' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [elevated, setElevated] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthed, user, clearSession } = useAuth()
  const menuRef = useRef<HTMLDivElement | null>(null)

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

  // Close profile dropdown on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!profileOpen) return
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [profileOpen])

  // Helpers
  const initials = (() => {
    const base = (user?.name || user?.email || 'U').trim()
    const parts = base.split(/\s+/)
    const ii = (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
    return ii.toUpperCase() || 'U'
  })()

  const handleGo = (href: string) => {
    setOpen(false)
    const go = () => {
      const isHashOnly = href.startsWith('#')
      if (isHashOnly) {
        const id = href.slice(1)
        if (location.pathname === '/') {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          navigate(`/#${id}`)
        }
        return
      }
      navigate(href)
    }
    setTimeout(go, 120)
  }

  // Auth-aware CTA handlers
  const onSignIn = () => {
    setOpen(false)
    if (isAuthed) navigate('/dashboard')
    else navigate('/signin')
  }
  const onGetStarted = () => {
    setOpen(false)
    if (isAuthed) navigate('/dashboard/builder')
    else navigate('/signup')
  }
  const onLogout = () => {
    clearSession()
    setOpen(false)
    setProfileOpen(false)
    navigate('/', { replace: true })
  }

  const DesktopLink = ({ item }: { item: NavItem }) =>
    item.href.startsWith('#') ? (
      <button
        onClick={() => handleGo(item.href)}
        className="text-[var(--subtle)] hover:text-white transition"
      >
        {item.label}
      </button>
    ) : (
      <Link to={item.href} className="text-[var(--subtle)] hover:text-white transition">
        {item.label}
      </Link>
    )

  return (
    <header className={`sticky top-0 z-50 transition-shadow ${elevated ? 'shadow-[0_8px_40px_rgba(0,0,0,.35)]' : ''}`}>
      <div className="backdrop-blur-xl bg-[rgba(15,18,22,.72)] border-b border-[var(--border)]">
        <nav className="container flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <span className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--gold)] text-sm font-semibold">
              CS
            </span>
            <span className="text-lg font-semibold">CardSync</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {LINKS.map((l) => <DesktopLink key={l.label} item={l} />)}
          </div>

          {/* Desktop CTAs (auth-aware) */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthed ? (
              <>
                <button onClick={onSignIn} className="text-[var(--subtle)] hover:text-white transition">
                  Sign in
                </button>
                <button onClick={onGetStarted} className="btn btn-gold px-4 py-2">
                  Get Started
                </button>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="btn btn-outline px-4 py-2">Dashboard</Link>
                <Link to="/dashboard/builder" className="btn btn-gold px-4 py-2">New Card</Link>

                {/* Profile dropdown */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setProfileOpen(v => !v)}
                    className="h-9 w-9 grid place-items-center rounded-full border border-[var(--border)] bg-[var(--muted)] text-sm font-semibold"
                    aria-haspopup="menu"
                    aria-expanded={profileOpen}
                    aria-label="Open profile menu"
                  >
                    {initials}
                  </button>

                  {profileOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-44 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(0,0,0,.45)] p-1"
                    >
                      <Link
                        to="/dashboard/settings"
                        onClick={() => setProfileOpen(false)}
                        className="block w-full text-left px-3 py-2 rounded-lg hover:bg-white/5"
                        role="menuitem"
                      >
                        Settings
                      </Link>

                      <button
                        onClick={onLogout}
                        className="block w-full text-left px-3 py-2 rounded-lg hover:bg-red-500/15 text-red-400 hover:text-red-300"
                        role="menuitem"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
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
      <div className={`md:hidden fixed inset-0 z-[60] ${open ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!open}>
        {/* Backdrop */}
        <div className={`absolute inset-0 bg-black/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} />

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

            {/* CTAs (auth-aware) */}
            <div className="mt-4 flex flex-col gap-2">
              {!isAuthed ? (
                <>
                  <button onClick={onSignIn} className="btn btn-outline w-full justify-center py-2.5">
                    Sign in
                  </button>
                  <button onClick={onGetStarted} className="btn btn-gold w-full justify-center py-2.5">
                    Get Started
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleGo('/dashboard')} className="btn btn-outline w-full justify-center py-2.5">
                    Dashboard
                  </button>
                  <button onClick={() => handleGo('/dashboard/builder')} className="btn btn-gold w-full justify-center py-2.5">
                    New Card
                  </button>
                  <button onClick={() => handleGo('/dashboard/settings')} className="btn w-full justify-center py-2.5">
                    Settings
                  </button>
                  <button
                    onClick={onLogout}
                    className="btn w-full justify-center py-2.5 hover:bg-red-500/15 text-red-400 hover:text-red-300"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
