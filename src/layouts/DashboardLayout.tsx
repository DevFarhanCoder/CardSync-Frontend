import { useState } from "react";
import { Outlet } from "react-router-dom";
import { X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* single sticky header */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--panel)]/80 backdrop-blur">
        <Topbar onOpenMenu={() => setOpen(true)} />
      </header>

      {/* Drawer on mobile, pinned on lg */}
      <aside
        className={[
          // cover the whole screen on mobile; sit under header on lg
          "fixed left-0 top-0 lg:top-14 bottom-0 z-[70] w-72 bg-[var(--panel)] border-r border-[var(--border)]",
          "transform transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        ].join(" ")}
      >
        {/* mobile close row */}
        <div className="lg:hidden flex items-center justify-between h-14 px-3 border-b border-[var(--border)]">
          <span className="font-semibold">Menu</span>
          <button
            className="h-9 w-9 grid place-items-center rounded-lg border border-[var(--border)]"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <div className="h-full overflow-y-auto">
          {/* Make labels visible and close after navigating */}
          <Sidebar expanded onNavigate={() => setOpen(false)} />
        </div>
      </aside>

      {/* Backdrop above header, below drawer */}
      {open && (
        <div
          className="fixed inset-0 z-[65] bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content (give space for pinned sidebar on lg) */}
      <main className="pt-0 lg:pl-72">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6 py-6 min-w-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
