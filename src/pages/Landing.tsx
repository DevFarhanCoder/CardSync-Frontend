// src/pages/Landing.tsx
import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BottomAd from "@/components/BottomAd";
import Footer from "@/components/Footer";
import {
  Check, Zap, Shield, Smartphone, QrCode, Share2, Sparkles,
  CreditCard, Building2, Globe, Database, MapPin, Mail,
} from "lucide-react";
import TrustedCarousel from "@/components/TrustedCarousel";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import FAQ from "@/components/FAQ";
import FlowChart from "@/components/FlowChart";
import PricingShowcase from "@/components/PricingShowcase";
import TwoMillionSection from "@/components/TwoMillionSection";
import { useAuth } from "@/context/AuthContext";

export default function Landing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthed, user } = useAuth();

  const [authOpen, setAuthOpen] = useState(false);

  // Show once per tab; remember if user closed it
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    return sessionStorage.getItem("hideWelcome") !== "1";
  });

  const features = [
    { icon: Smartphone, title: "Mobile-First Sharing", desc: "Tap-to-share and QR-compatible cards. Works offline as PWA." },
    { icon: Shield, title: "Enterprise Security", desc: "Role-based access, SSO, and field-level privacy controls." },
    { icon: Zap, title: "Real-Time Analytics", desc: "Track views, saves, and conversions at team and org level." },
    { icon: QrCode, title: "Smart QR & NFC", desc: "Personalized QR, NFC tags & deep links for campaigns." },
    { icon: Share2, title: "CRM Sync", desc: "One-click sync to HubSpot, Salesforce, Notion & Google Contacts." },
    { icon: Sparkles, title: "AI Profile Assistant", desc: "Auto-generate bios, highlights, and follow-up messages." },
  ];

  const faq = [
    { q: "How is Instantlly-Cards different from paper cards?", a: "Every interaction is trackable. Update details centrally and capture leads instantly with QR/NFC—no reprints needed." },
    { q: "Can I use my own domain and branding?", a: "Yes. Upload logos, define fonts/colors, and assign custom subdomains such as cards.yourcompany.com." },
    { q: "Do you support large teams?", a: "SSO, SCIM provisioning, roles/permissions, bulk templates, audit logs, and playbooks help org-wide rollouts." },
    { q: "What about privacy?", a: "Granular visibility controls let you hide emails/phone by default, enforce approvals, and auto-expire links." },
  ];

  // Start Free Trial behavior:
  // - If logged in: go to /pricing
  // - If not logged in: open Sign In / Create Account modal
  function onStartTrial() {
    if (isAuthed) {
      if (location.pathname !== "/pricing") navigate("/pricing");
      return;
    }
    setAuthOpen(true);
  }

  const goSignIn = () => {
    setAuthOpen(false);
    navigate("/signin", { state: { from: location.pathname, intent: { type: "view-pricing" } } });
  };
  const goSignUp = () => {
    setAuthOpen(false);
    navigate("/signup", { state: { from: location.pathname, intent: { type: "view-pricing" } } });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      {/* Logged-in welcome strip (moved inside JSX so it renders) */}
      {isAuthed && showWelcome && (
        <section className="container my-6">
          <div className="relative glass rounded-2xl p-6">
            {/* close (X) */}
            <button
              aria-label="Dismiss"
              onClick={() => {
                setShowWelcome(false);
                sessionStorage.setItem("hideWelcome", "1");
              }}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-white/5"
            >
              <span className="text-lg leading-none">×</span>
            </button>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Welcome back, {user?.name} 👋</h3>
                <p className="text-[var(--subtle)] text-sm">Manage your profile and account settings.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Hero */}
      <section className="container pt-24 pb-12 text-center">
        <div className="chip mx-auto">Professional Digital Networking</div>
        <h1 className="mt-6 text-5xl md:text-6xl font-bold leading-[1.1]">
          Share Your Professional, <span className="text-[var(--gold)]">Identity</span> Instantly.
        </h1>
        <p className="mt-6 mx-auto max-w-3xl text-[var(--subtle)]">
          Create, share and manage premium digital business cards with live analytics, lead capture, and enterprise controls.
          Instantlly-Cards helps individuals and companies modernize their networking.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button onClick={onStartTrial} className="btn btn-gold">Start Free Trial</button>
          <Link to="/demo" className="btn btn-outline">View Demo</Link>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {features.map((f, i) => (
            <div key={i} className="card px-6 py-6 text-left">
              <f.icon className="text-[var(--gold)] w-6 h-6" />
              <h4 className="mt-4 font-semibold text-base">{f.title}</h4>
              <p className="mt-2 text-sm text-[var(--subtle)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NEW: Trusted carousel (continuous) */}
      <TwoMillionSection />

      {/* Who it's for (title added) */}
      <section className="container py-10">
        <h3 className="text-2xl md:text-3xl font-semibold mb-6 text-center">Who is Instantlly-Cards for?</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Individuals & Creators", desc: "Premium personal card with social links, portfolio, booking & quick actions.", icon: CreditCard },
            { title: "Sales & Field Teams", desc: "Standard templates, UTM links & CRM sync. Track meetings and conversions.", icon: Building2 },
            { title: "Events & Booths", desc: "Dynamic QR for banners, offline PWA, spin up campaign cards in minutes.", icon: Globe },
          ].map((b, i) => (
            <div key={i} className="card p-8">
              <b.icon className="text-[var(--gold)]" />
              <h3 className="text-xl font-semibold mt-3">{b.title}</h3>
              <p className="text-[var(--subtle)] mt-2">{b.desc}</p>
              <ul className="mt-3 text-sm space-y-2">
                {["Template presets", "Deep links to apps", "Export as vCard / Wallet"].map((l, j) => (
                  <li key={j} className="flex gap-2 items-start">
                    <Check size={16} className="text-[var(--gold)] mt-1" /> {l}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Animated Flow Chart */}
      <FlowChart />

      {/* Integrations */}
      <section className="container grid md:grid-cols-3 gap-6 py-10">
        {[
          { title: "HubSpot & Salesforce", desc: "Two-way sync of contacts & activities with dedupe and field mapping.", icon: Database },
          { title: "Google Suite", desc: "Add to Google Contacts, Calendar booking links, Drive files on cards.", icon: Mail },
          { title: "Maps & Actions", desc: "One-tap directions, call, email, WhatsApp, FaceTime and more.", icon: MapPin },
        ].map((x, i) => (
          <div className="magic-card" key={i}>
            <div className="inner p-8">
              <x.icon className="text-[var(--gold)]" />
              <div className="mt-3 text-xl font-semibold">{x.title}</div>
              <p className="text-[var(--subtle)] mt-2">{x.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Pricing Plans (new) */}
      <section className="py-16 bg-[var(--bg)]">
        <div className="container flex justify-center">
          <PricingShowcase />
        </div>
      </section>

      {/* Testimonials with avatars + carousel */}
      <TestimonialCarousel />

      {/* CTA */}
      <section className="w-full bg-[var(--background)] py-16 text-center">
        <h3 className="text-3xl font-semibold">Ready to transform your networking?</h3>
        <p className="text-[var(--subtle)] mt-2">
          Join thousands of professionals using Instantlly-Cards to make better connections.
        </p>
        <div className="mt-6 flex gap-4 justify-center">
          <Link to="/pricing" className="btn btn-gold">See Pricing</Link>
          <Link to="/features" className="btn btn-outline">Explore Features</Link>
        </div>
      </section>

      <FAQ items={faq} />
      <Footer />

      {/* ---- Bottom Ad (fixed, dismissible). Pick one: image or text ---- */}
      {/* ---- Bottom Ad: full-width Barter Adverts banner ---- */}
      <BottomAd
        href="https://barteradverts.com"
        // Use your own hosted banner (recommended):
        // imageUrl="/assets/ads/barter-adverts-banner.jpg"
        // Temporary placeholder (black background + gold text):
        imageUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNM420o1AXGgbfZi5zl5wedW2W97H6-hu77Q&s"
        alt="Barter Adverts — Swap & Save"
        ttlHours={24}
        showDelayMs={400}
        height={{ mobile: 88, desktop: 120 }}
      />

      {/*
      // Text banner version:
      <BottomAd href="https://instantllycards.com/pricing" ttlHours={24} showDelayMs={400} />
      */}

      {/* ---- Auth modal for guests (Start Free Trial) ---- */}
      {authOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setAuthOpen(false)} />
          <div className="relative z-10 flex items-center justify-center min-h-full p-4">
            <div role="dialog" aria-modal="true" className="card w-full max-w-sm p-6">
              <h3 className="text-lg font-semibold text-center">Start your free trial</h3>
              <p className="text-sm text-[var(--subtle)] text-center mt-1">
                Sign in or create an account to continue.
              </p>
              <div className="mt-5 grid gap-2">
                <button onClick={goSignIn} className="btn btn-gold w-full">Sign In</button>
                <button onClick={goSignUp} className="btn w-full">Create Account</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
