import { AreaChart, Area, ResponsiveContainer } from 'recharts'

export default function AreaSpark({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="h-16">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <Area type="monotone" dataKey="value" stroke="#D4AF37" fill="rgba(212,175,55,0.2)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
