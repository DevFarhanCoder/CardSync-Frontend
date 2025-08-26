import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  LineChart,
  Users,
  BookUser,
  Store,
  Boxes,
  Settings,
  Headset,
  Wallet,
} from "lucide-react";

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
];

type SidebarProps = {
  expanded?: boolean;          // show labels
  className?: string;
  onNavigate?: () => void;     // close drawer on click
};

export default function Sidebar({
  expanded = true,
  className = "",
  onNavigate,
}: SidebarProps) {
  const linkBase =
    "flex items-center gap-3 rounded-xl px-3 py-2 transition border";
  const linkIdle =
    "text-[var(--subtle)] border-transparent hover:bg-[var(--muted)]";
  const linkActive =
    "bg-[var(--muted)] border-[var(--gold)] text-white";

  return (
    <nav className={`w-72 shrink-0 flex flex-col gap-2 p-3 ${className}`}>
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/dashboard"}
          onClick={onNavigate}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkIdle}`
          }
        >
          <Icon size={18} />
          <span className={expanded ? "inline" : "hidden lg:inline"}>
            {label}
          </span>
        </NavLink>
      ))}
      <div className="mt-auto text-xs text-[var(--subtle)] px-2">
        v1.0 • Luxe theme
      </div>
    </nav>
  );
}
