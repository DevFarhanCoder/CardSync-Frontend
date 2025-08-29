export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="grid h-8 w-8 place-items-center rounded-xl border border-[var(--gold)] bg-[var(--muted)] text-[var(--gold)] font-bold">
        CS
      </div>
      <span className="text-lg font-semibold tracking-wide">Instantlly-Cards</span>
    </div>
  )
}
