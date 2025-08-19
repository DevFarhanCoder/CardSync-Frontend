import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Topbar />
      <div className="container flex gap-6 py-6">
        <Sidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
