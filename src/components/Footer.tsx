import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] mt-24">
      <div className="container py-12 grid gap-10 md:grid-cols-4">
        <div>
          <Logo />
          <p className="text-sm text-[var(--subtle)] mt-4 max-w-sm">
            Professional digital business cards with enterprise-grade analytics, integrations, and contact syncing.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Product</h4>
          <ul className="space-y-2 text-[var(--subtle)]">
            <li>Features</li><li>Templates</li><li>Mobile App</li><li>Security</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-[var(--subtle)]">
            <li>About</li><li>Careers</li><li>Contact</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Resources</h4>
          <ul className="space-y-2 text-[var(--subtle)]">
            <li>Docs</li><li>Blog</li><li>Status</li><li>Privacy</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--border)] py-6 text-center text-sm text-[var(--subtle)]">
        © 2025 CardSync. All rights reserved.
      </div>
    </footer>
  )
}
