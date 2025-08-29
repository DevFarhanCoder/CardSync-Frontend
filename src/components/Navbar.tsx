import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Demo", href: "/demo" },
  { label: "Explore", href: "/explore" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [elevated, setElevated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthed, user, clearSession } = useAuth();

  // detect if we are inside the dashboard
  const isOnDashboard = useMemo(
    () => location.pathname.startsWith("/dashboard"),
    [location.pathname]
  );

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const initials = useMemo(() => {
    if (!user) return "U";
    const base = (user.name || user.email || "U").trim();
    const parts = base.split(/\s+/);
    return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
  }, [user]);

  const go = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  const newCard = () => {
    setOpen(false);
    if (isAuthed) navigate("/dashboard/builder");
    else navigate("/signup");
  };

  const onDashboard = () => {
    setOpen(false);
    navigate("/dashboard");
  };

  const onLogout = () => {
    clearSession?.();
    setOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow ${
        elevated ? "shadow-[0_8px_40px_rgba(0,0,0,.35)]" : ""
      }`}
    >
      <div className="backdrop-blur-xl bg-[rgba(15,18,22,.72)] border-b border-[var(--border)]">
        <nav className="container flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <span className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--gold)] text-sm font-semibold">
              IC
            </span>
            <span className="text-lg font-semibold">Instantlly-Cards</span>
          </Link>

          {/* Center nav links (hidden on dashboard pages) */}
          {!isOnDashboard && (
            <div className="hidden md:flex items-center gap-6">
              {LINKS.map((l) => (
                <Link key={l.href} to={l.href} className="text-[var(--subtle)] hover:text-white transition">
                  {l.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {isOnDashboard ? (
              // === DASHBOARD: ONLY New Card ===
              <button
                onClick={newCard}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium bg-yellow-500 hover:bg-yellow-400 text-black shadow"
              >
                <Plus className="h-4 w-4" />
                New Card
              </button>
            ) : isAuthed ? (
              // === PUBLIC PAGES when signed in ===
              <>
                <button onClick={onDashboard} className="btn btn-outline px-4 py-2">
                  Dashboard
                </button>
                <button
                  onClick={newCard}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium bg-yellow-500 hover:bg-yellow-400 text-black shadow"
                >
                  <Plus className="h-4 w-4" />
                  New Card
                </button>
                {/* Avatar */}
                <div className="relative group">
                  <button
                    className="h-9 w-9 grid place-items-center rounded-full border border-[var(--border)] bg-[var(--muted)] text-sm font-semibold"
                  >
                    {initials}
                  </button>
                  <div
                    className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition
                               absolute right-0 mt-2 w-44 rounded-xl border border-[var(--border)]
                               bg-[var(--surface)] shadow-[0_20px_60px_rgba(0,0,0,.45)] p-1"
                  >
                    <Link to="/dashboard/settings" className="block w-full px-3 py-2 rounded-lg hover:bg-white/5">
                      Settings
                    </Link>
                    <button
                      onClick={onLogout}
                      className="block w-full px-3 py-2 rounded-lg hover:bg-red-500/15 text-red-400 hover:text-red-300"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // === PUBLIC PAGES when not signed in ===
              <>
                <Link to="/signin" className="text-[var(--subtle)] hover:text-white transition px-3 py-2">
                  Sign in
                </Link>
                <button
                  onClick={newCard}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium bg-yellow-500 hover:bg-yellow-400 text-black shadow"
                >
                  <Plus className="h-4 w-4" />
                  New Card
                </button>
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

      {/* Mobile drawer */}
      {/* Same logic: if on dashboard, only show New Card; else show normal menu */}
      <div className={`md:hidden fixed inset-0 z-[60] ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
        <div
          className={`
            absolute left-0 right-0 top-0
            border-b border-[var(--border)]
            bg-[rgba(15,18,22,.95)] backdrop-blur-xl
            shadow-[0_16px_60px_rgba(0,0,0,.45)]
            transition-transform duration-300 ease-out
            ${open ? "translate-y-0" : "-translate-y-full"}
          `}
        >
          <div className="container pt-3 pb-6">
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--gold)] text-sm font-semibold">
                  IC
                </span>
                <span className="text-lg font-semibold">Instantlly-Cards</span>
              </div>
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {!isOnDashboard && (
              <div className="mt-3 divide-y divide-[var(--border)]">
                {LINKS.map((l) => (
                  <button
                    key={l.href}
                    onClick={() => go(l.href)}
                    className="w-full text-left px-2 py-3 text-base text-[var(--text)] hover:bg-white/5 rounded-lg transition"
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 grid gap-2">
              {isOnDashboard ? (
                <button
                  onClick={newCard}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium bg-yellow-500 hover:bg-yellow-400 text-black shadow"
                >
                  <Plus className="h-4 w-4" />
                  New Card
                </button>
              ) : isAuthed ? (
                <>
                  <button onClick={onDashboard} className="btn btn-outline w-full justify-center py-2.5">
                    Dashboard
                  </button>
                  <button
                    onClick={newCard}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium bg-yellow-500 hover:bg-yellow-400 text-black shadow"
                  >
                    <Plus className="h-4 w-4" />
                    New Card
                  </button>
                  <button onClick={onLogout} className="btn w-full justify-center py-2.5 hover:bg-red-500/15 text-red-400 hover:text-red-300">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signin" className="btn btn-outline w-full justify-center py-2.5">
                    Sign in
                  </Link>
                  <button
                    onClick={newCard}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium bg-yellow-500 hover:bg-yellow-400 text-black shadow"
                  >
                    <Plus className="h-4 w-4" />
                    New Card
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
