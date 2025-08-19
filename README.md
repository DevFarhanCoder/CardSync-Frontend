# CardSync UI (Luxe Theme)

A modern, content-rich UI for CardSync using **Vite + React + TypeScript + Tailwind**. 
The palette follows a premium **black / grey / gold** look inspired by high-end card brands.

## Quick start

```bash
npm i
npm run dev
```

> Requires Node 18+.

## Notable choices
- Tailwind with a **Luxe** theme (see `tailwind.config.ts`).
- Reusable components: Navbar, Footer, Sidebar, Topbar, Stat cards, Charts, DataTable.
- Pages: Landing, Features, Pricing, Demo, Auth (Sign in/Sign up).
- Dashboard: Overview, My Cards, Card Builder, Analytics, Contacts, Team, Marketplace, Integrations, Settings, Billing, Support.

## Packages to install automatically
- `lucide-react` for icons
- `recharts` for simple charts
- `framer-motion` for tasteful micro-animations (optional in v1)

### Theming
Colors live under `luxe` in `tailwind.config.ts`. Primary accent is **gold** `#D4AF37`.

---

This repo intentionally keeps business logic out—hook it up to Firebase/Firestore/Supabase as needed.
