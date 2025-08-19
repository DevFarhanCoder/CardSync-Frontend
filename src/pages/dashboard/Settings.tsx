export default function Settings() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card p-6">
        <h3 className="font-semibold">Profile</h3>
        <div className="grid gap-3 mt-3">
          <input className="rounded-xl bg-[var(--muted)] border border-[var(--border)] px-3 py-2" placeholder="Full Name"/>
          <input className="rounded-xl bg-[var(--muted)] border border-[var(--border)] px-3 py-2" placeholder="Job Title"/>
          <input className="rounded-xl bg-[var(--muted)] border border-[var(--border)] px-3 py-2" placeholder="Company"/>
          <button className="btn btn-gold w-fit">Save</button>
        </div>
      </div>
      <div className="card p-6">
        <h3 className="font-semibold">Privacy</h3>
        <div className="grid gap-3 mt-3">
          <label className="flex items-center gap-2"><input type="checkbox"/> Show email on card</label>
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked/> Allow contact downloads</label>
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked/> Show social links</label>
          <button className="btn btn-outline w-fit">Reset</button>
        </div>
      </div>
    </div>
  )
}
