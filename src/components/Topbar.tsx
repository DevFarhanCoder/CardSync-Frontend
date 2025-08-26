import { Bell, Plus, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Topbar({ onOpenMenu }: { onOpenMenu?: () => void }) {
  // NOTE: no `sticky` here — this is just the inner row.
  return (
    <div className="container h-14 flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        {/* mobile hamburger */}
        <button
          onClick={onOpenMenu}
          className="lg:hidden h-9 w-9 grid place-items-center rounded-lg border border-[var(--border)]"
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>

        {/* brand on mobile */}
        <Link to="/" className="md:hidden">
          <Logo />
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/dashboard/builder" className="btn btn-gold gap-2">
          <Plus size={16} /> New Card
        </Link>
        <button className="relative rounded-xl p-2 hover:bg-[var(--muted)]" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[var(--gold)] text-[10px] text-black grid place-items-center">
            3
          </span>
        </button>
        <img
          className="h-8 w-8 rounded-full border border-[var(--gold)]"
          src="https://ui-avatars.com/api/?name=John+Doe&background=151A21&color=D4AF37"
          alt="avatar"
        />
      </div>
    </div>
  );
}
