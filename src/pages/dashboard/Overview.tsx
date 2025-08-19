import StatCard from '@/components/StatCard'
import BarMini from '@/components/BarMini'
import AreaSpark from '@/components/AreaSpark'
import { Share2, Eye, LineChart, Users } from 'lucide-react'

const bars = Array.from({length: 14}).map((_,i)=>({name:String(i+1), value: Math.round(Math.random()*50)+10 }))
const spark = Array.from({length: 20}).map((_,i)=>({name:String(i+1), value: Math.round(Math.random()*100)+20 }))

export default function Overview() {
  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard title="Total Views" value={245} foot="+12% from last week" icon={<Eye size={18}/>}/>
        <StatCard title="Total Shares" value={35} foot="Across all cards" icon={<Share2 size={18}/>}/>
        <StatCard title="New Connections" value={18} foot="This month" icon={<Users size={18}/>}/>
        <StatCard title="Engagement Score" value={"78"} foot="Rolling 30 days" icon={<LineChart size={18}/>}/>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-6">
          <h3 className="font-semibold">Views</h3>
          <div className="mt-2"><BarMini data={bars} /></div>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold">Shares</h3>
          <div className="mt-2"><BarMini data={bars} /></div>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold">Conversion Trend</h3>
          <div className="mt-2"><AreaSpark data={spark} /></div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold">Recent Activity</h3>
        <ul className="mt-3 text-sm space-y-2 text-[var(--subtle)]">
          <li>• Professional card viewed 12 times today</li>
          <li>• New connection from Sarah Johnson</li>
          <li>• QR code scan from trade-show booth</li>
        </ul>
      </div>
    </div>
  )
}
