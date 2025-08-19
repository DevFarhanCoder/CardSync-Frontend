import * as React from 'react'

type Column<T> = { key: keyof T; label: string; render?: (value: any, row: T) => React.ReactNode }

export default function DataTable<T extends Record<string, any>>({ columns, data }: { columns: Column<T>[]; data: T[] }) {
  return (
    <div className="overflow-auto border border-[var(--border)] rounded-2xl">
      <table className="min-w-full text-sm">
        <thead className="bg-[var(--muted)] text-left">
          <tr>
            {columns.map(c => <th key={String(c.key)} className="px-4 py-3 font-medium">{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t border-[var(--border)] hover:bg-[rgba(255,255,255,0.02)]">
              {columns.map(c => (
                <td key={String(c.key)} className="px-4 py-3 text-[var(--subtle)]">
                  {c.render ? c.render(row[c.key], row) : String(row[c.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
