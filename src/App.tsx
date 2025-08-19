import { Route, Routes } from 'react-router-dom'
import Landing from '@/pages/Landing'
import Features from '@/pages/Features'
import Pricing from '@/pages/Pricing'
import Demo from '@/pages/Demo'
import SignIn from '@/pages/auth/SignIn'
import SignUp from '@/pages/auth/SignUp'
import DashboardLayout from '@/layouts/DashboardLayout'
import Overview from '@/pages/dashboard/Overview'
import MyCards from '@/pages/dashboard/MyCards'
import CardBuilder from '@/pages/dashboard/CardBuilder'
import Analytics from '@/pages/dashboard/Analytics'
import Contacts from '@/pages/dashboard/Contacts'
import Team from '@/pages/dashboard/Team'
import Settings from '@/pages/dashboard/Settings'
import Billing from '@/pages/dashboard/Billing'
import Integrations from '@/pages/dashboard/Integrations'
import Marketplace from '@/pages/dashboard/Marketplace'
import Support from '@/pages/dashboard/Support'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/features" element={<Features />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Overview />} />
        <Route path="cards" element={<MyCards />} />
        <Route path="builder" element={<CardBuilder />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="team" element={<Team />} />
        <Route path="integrations" element={<Integrations />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="settings" element={<Settings />} />
        <Route path="billing" element={<Billing />} />
        <Route path="support" element={<Support />} />
      </Route>
    </Routes>
  )
}
