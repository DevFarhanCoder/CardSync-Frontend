import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts'
export default function BarMini({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" hide />
          <Bar dataKey="value" fill="rgba(212,175,55,0.7)" radius={[6,6,0,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
