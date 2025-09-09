import { Route, Routes, Navigate } from "react-router-dom";
import Landing from "@/pages/Landing";
import Features from "@/pages/Features";
import Pricing from "@/pages/Pricing";
import Demo from "@/pages/Demo";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import DashboardLayout from "@/layouts/DashboardLayout";
import Chat from "@/pages/dashboard/Chat";
import Overview from "@/pages/dashboard/Overview";
import NewCard from "@/pages/cards/NewCard";
import MyCards from "@/pages/dashboard/MyCards";
import CardBuilder from "@/pages/dashboard/CardBuilder";
import Analytics from "@/pages/dashboard/Analytics";
import ShareRecords from "@/pages/dashboard/ShareRecords";
import Contacts from "@/pages/dashboard/Contacts";
import Team from "@/pages/dashboard/Team";
import Settings from "@/pages/dashboard/Settings";
import Billing from "@/pages/dashboard/Billing";
import Integrations from "@/pages/dashboard/Integrations";
import Marketplace from "@/pages/dashboard/Marketplace";
import Support from "@/pages/dashboard/Support";
import Explore from "@/pages/Explore";
import PublicProfile from "@/pages/PublicProfile";
import ShareCard from "@/pages/Share";
import { RequireAnon, RequireAuth } from "./routes/guards";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DeleteAccount from "./pages/DeleteAccount";
import ChatDirect from "./pages/dashboard/ChatDirect";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/features" element={<Features />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/demo" element={<Demo />} />

      {/* public */}
      <Route path="/explore" element={<Explore />} />
      <Route path="/public/profile/:owner/cards" element={<PublicProfile />} />

      {/* share (auth) */}
      <Route path="/share/:id" element={<RequireAuth><ShareCard /></RequireAuth>} />

      <Route path="/signin" element={<RequireAnon><SignIn /></RequireAnon>} />
      <Route path="/signup" element={<RequireAnon><SignUp /></RequireAnon>} />

      {/* Dashboard (protected) */}
      <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
        <Route index element={<Overview />} />
        <Route path="chat" element={<Chat />} />
        <Route path="/dashboard/chat/direct/:peerId" element={<ChatDirect />} />
        <Route path="cards/new" element={<NewCard />} />
        <Route path="cards" element={<MyCards />} />
        <Route path="builder" element={<CardBuilder />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="shares" element={<ShareRecords />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="team" element={<Team />} />
        <Route path="integrations" element={<Integrations />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="settings" element={<Settings />} />
        <Route path="billing" element={<Billing />} />
        <Route path="support" element={<Support />} />
      </Route>

      {/* catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/delete-account" element={<DeleteAccount />} />
    </Routes>
  );
}
