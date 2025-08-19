// src/pages/pricing-plans.tsx
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PricingHero from '@/components/PricingHero'

// Use either PlanGridLong or CompactPricingGrid depending on your design
import CompactPricingGrid from '@/components/CompactPricingGrid'
// import PlanGridLong from '@/components/PlanGridLong'

import TrustedCarousel from '@/components/TrustedCarousel'
import ComparePlans from '@/components/ComparePlans'
import FAQ from '@/components/FAQ'
import TwoMillionSection from '@/components/TwoMillionSection' // <-- new section

const faq = [
  { q: 'Is there a free trial?', a: 'Yes—Pro includes a 14-day free trial. No credit card required.' },
  { q: 'Can I mix plans?', a: 'Absolutely. Assign Free/Pro seats and upgrade only the users who need advanced features.' },
  { q: 'Do you offer annual billing?', a: 'Save ~20% with annual billing on paid plans.' },
  { q: 'Do you have NGO/education pricing?', a: 'We offer discounts for qualified organizations—contact sales.' },
]

export default function PricingPlansPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Navbar />

      {/* Hero Section */}
      <PricingHero />

      <main className="space-y-20 pb-20">
        {/* 2 Million Section */}
        <section className="container my-10 md:my-14">
          <TwoMillionSection />
        </section>

        {/* Pricing Plans */}
        <section aria-labelledby="plans-title" className="container">
          <h2 id="plans-title" className="sr-only">Plans</h2>
          <CompactPricingGrid defaultCurrency="INR" />
          {/* or use: <PlanGridLong defaultCurrency="INR" /> */}
        </section>

        {/* Trusted by Clients Carousel */}
        {/* <TrustedCarousel /> */}

        {/* Compare Plans */}
        <ComparePlans />

        {/* FAQs */}
        <section className="container">
          <FAQ items={faq} title="Pricing FAQs" />
        </section>
      </main>

      <Footer />
    </div>
  )
}
