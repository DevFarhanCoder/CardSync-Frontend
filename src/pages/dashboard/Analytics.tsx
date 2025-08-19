import BarMini from '@/components/BarMini'
import AreaSpark from '@/components/AreaSpark'

const bars = Array.from({length: 24}).map((_,i)=>({name:String(i+1), value: Math.round(Math.random()*100)+30 }))
const spark = Array.from({length: 30}).map((_,i)=>({name:String(i+1), value: Math.round(Math.random()*100)+20 }))

export default function Analytics() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card p-6"><h3 className="font-semibold">Views by Day</h3><div className="mt-2"><BarMini data={bars}/></div></div>
      <div className="card p-6"><h3 className="font-semibold">Conversions</h3><div className="mt-2"><AreaSpark data={spark}/></div></div>
      <div className="card p-6 md:col-span-2">
        <h3 className="font-semibold">Top Links</h3>
        <ul className="grid md:grid-cols-3 gap-3 mt-3">
          {['Website','LinkedIn','Email','Phone','WhatsApp','Directions'].map((l,i)=>(
            <li key={i} className="chip justify-between"><span>{l}</span><span className="text-[var(--gold)]">{Math.round(Math.random()*120)+20}</span></li>
          ))}
        </ul>
      </div>
    </div>
  )
}
