import { Plus, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Topbar({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const navigate = useNavigate();

  const goNewCard = () => {
    navigate("/dashboard/builder");
  };

  return (
    <div className="container h-14 flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        {/* mobile hamburger (dashboard sidebar opener) */}
        <button
          onClick={onOpenMenu}
          className="lg:hidden h-9 w-9 grid place-items-center rounded-lg border border-[var(--border)]"
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>

        {/* brand text only on mobile (no CS avatar) */}
        <span className="md:hidden text-base font-semibold text-white">
          Instantly-Cards
        </span>
      </div>

      {/* Right side: ONLY "New Card" in dashboard */}
      <div className="flex items-center">
        <button
          onClick={goNewCard}
          className="btn btn-gold gap-1 px-3 py-1.5 text-sm font-medium"
          aria-label="Create a new card"
        >
          <Plus size={14} /> New Card
        </button>
      </div>
    </div>
  );
}
