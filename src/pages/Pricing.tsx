// src/pages/Pricing.tsx
import React from "react";
import Navbar from "@/components/Navbar";
import PricingHero from "@/components/PricingHero";
import PricingShowcase from "@/components/PricingShowcase";
import PricingDemoForm from "@/components/PricingDemoForm";
import Footer from "@/components/Footer";

export default function Pricing() {
  return (
    <>
      {/* Top navigation */}
      <Navbar />

      {/* Hero (CTA buttons are auth-aware inside the component) */}
      <PricingHero />

      {/* Social proof / stats */}
      <section className="py-10 border-b border-[var(--border)]">
        <div className="container">
          <div className="text-center">
            <span className="chip">Social proof</span>
            <h2 className="mt-3 text-3xl font-semibold">
              Over <span className="text-[var(--gold)]">2 Million</span> Professionals Choose CardSync
            </h2>
            <p className="mt-2 text-[var(--subtle)]">
              Enterprise-grade reliability with consumer-grade polish—trusted worldwide by individuals and teams.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card p-6 text-center">
              <div className="text-3xl font-semibold">2M+</div>
              <div className="text-[var(--subtle)]">Professionals</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-semibold">75k+</div>
              <div className="text-[var(--subtle)]">Teams & Orgs</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-semibold">120+</div>
              <div className="text-[var(--subtle)]">Countries</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-semibold">1B+</div>
              <div className="text-[var(--subtle)]">Link / QR Shares</div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="pill">SSO &amp; SCIM</span>
            <span className="pill">SOC 2</span>
            <span className="pill">GDPR-ready</span>
            <span className="pill">PWA + Offline</span>
            <span className="pill">CRM Sync</span>
          </div>
        </div>
      </section>

      {/* Pricing grid (auth-aware plan buttons inside the component) */}
      <PricingShowcase defaultCurrency="INR" />

      {/* Compare plans */}
      <section className="py-12">
        <div className="container">
          <h3 className="text-center text-2xl font-semibold mb-6">Compare Plans</h3>
          <div className="overflow-x-auto card p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[var(--border)]">
                  <th className="px-4 py-3 w-[40%]">Feature</th>
                  <th className="px-4 py-3">Free</th>
                  <th className="px-4 py-3">Pro</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3 text-white/90">{r.label}</td>
                    <td className="px-4 py-3">{r.free}</td>
                    <td className="px-4 py-3">{r.pro}</td>
                    <td className="px-4 py-3">{r.team}</td>
                    <td className="px-4 py-3">{r.ent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 border-y border-[var(--border)]">
        <div className="container">
          <h3 className="text-center text-2xl font-semibold mb-6">Pricing FAQs</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <Faq q="Is there a free trial?">Yes—Pro includes a 14-day free trial. No credit card required.</Faq>
            <Faq q="Can I mix plans?">Yes, teams can mix Free and Pro seats; billing is prorated per seat.</Faq>
            <Faq q="Do you offer annual billing?">Yes, with a discount. You can switch monthly/annual anytime.</Faq>
            <Faq q="Do you have NGO/education pricing?">We do—contact sales and we’ll set you up with community pricing.</Faq>
          </div>
        </div>
      </section>

      {/* Footer*/}
      <Footer />
    </>
  );
}

/* ----------------------- Static compare table data ---------------------- */

const check = <span className="text-emerald-400">✓</span>;
const dash = <span className="text-white/30">—</span>;

const rows = [
  { label: "Cards per user",                free: "1",       pro: "Unlimited", team: "Unlimited", ent: "Unlimited" },
  { label: "Analytics (views, clicks)",     free: check,     pro: check,       team: "Advanced",  ent: "Enterprise" },
  { label: "Lead capture forms",            free: dash,      pro: check,       team: check,       ent: check },
  { label: "UTM tracking",                  free: dash,      pro: check,       team: check,       ent: check },
  { label: "CRM sync (HubSpot, Salesforce, Notion, Google)", free: dash, pro: check, team: check, ent: check },
  { label: "AI profile assistant",          free: dash,      pro: check,       team: check,       ent: check },
  { label: "Team roles & SSO/SCIM",         free: dash,      pro: dash,        team: check,       ent: check },
  { label: "Template locking / brand kits", free: dash,      pro: check,       team: check,       ent: check },
  { label: "Dedicated infra / VPC / DPA",   free: dash,      pro: dash,        team: dash,        ent: check },
  { label: "SLA & priority support",        free: "Business hours", pro: "Priority", team: "Priority", ent: "24×7" },
];

/* ------------------------------ FAQ item ------------------------------- */

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="card p-0 overflow-hidden">
      <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between">
        <span className="font-medium">{q}</span>
        <span className="text-[var(--subtle)]">▾</span>
      </summary>
      <div className="px-4 pb-4 text-[var(--subtle)] text-sm">{children}</div>
    </details>
  );
}
