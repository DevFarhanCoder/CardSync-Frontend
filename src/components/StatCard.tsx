import { ReactNode } from 'react'

export default function StatCard({ title, value, foot, icon }: { title: string; value: string | number; foot?: string; icon?: ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--subtle)]">{title}</p>
        <div className="text-[var(--gold)]">{icon}</div>
      </div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      {foot && <div className="mt-2 text-xs text-[var(--subtle)]">{foot}</div>}
    </div>
  )
}
