import { Bell, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Topbar() {
  return (
    <div className="sticky top-0 z-30 h-16 border-b border-[var(--border)] bg-[rgba(15,18,22,0.7)] backdrop-blur">
      <div className="container flex items-center justify-between h-full">
        <Link to="/" className="md:hidden"><Logo /></Link>
        <div className="hidden md:block" />
        <div className="flex items-center gap-3">
          <Link to="/dashboard/builder" className="btn btn-gold gap-2"><Plus size={16}/> New Card</Link>
          <button className="relative rounded-xl p-2 hover:bg-[var(--muted)]">
            <Bell size={18}/>
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[var(--gold)] text-[10px] text-black grid place-items-center">3</span>
          </button>
          <img className="h-8 w-8 rounded-full border border-[var(--gold)]" src="https://ui-avatars.com/api/?name=John+Doe&background=151A21&color=D4AF37" />
        </div>
      </div>
    </div>
  )
}
