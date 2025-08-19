import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CreditCard, LineChart, Users, BookUser, Store, Boxes, Settings, Headset, Wallet } from 'lucide-react'

const items = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/cards", label: "My Cards", icon: CreditCard },
  { to: "/dashboard/builder", label: "Card Builder", icon: Boxes },
  { to: "/dashboard/analytics", label: "Analytics", icon: LineChart },
  { to: "/dashboard/contacts", label: "Contacts", icon: BookUser },
  { to: "/dashboard/team", label: "Team", icon: Users },
  { to: "/dashboard/marketplace", label: "Marketplace", icon: Store },
  { to: "/dashboard/integrations", label: "Integrations", icon: Wallet },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
  { to: "/dashboard/support", label: "Support", icon: Headset },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 shrink-0 h-[calc(100vh-64px)] sticky top-16 flex-col gap-2 p-3 border-r border-[var(--border)] bg-[var(--surface)]">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/dashboard'}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2 transition border ${isActive ? 'bg-[var(--muted)] border-[var(--gold)] text-white' : 'text-[var(--subtle)] border-transparent hover:bg-[var(--muted)]'}`
          }
        >
          <Icon size={18} />
          <span>{label}</span>
        </NavLink>
      ))}
      <div className="mt-auto text-xs text-[var(--subtle)] px-2">
        v1.0 • Luxe theme
      </div>
    </aside>
  )
}
