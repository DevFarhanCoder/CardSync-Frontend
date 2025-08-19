import { Link } from 'react-router-dom'

export default function SignIn() {
  return (
    <div className="min-h-screen grid place-items-center bg-[var(--bg)]">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold text-center">Welcome Back</h1>
        <p className="text-center text-[var(--subtle)] mt-1">Sign in to manage your cards</p>
        <form className="mt-6 grid gap-4">
          <div>
            <label className="text-sm">Email</label>
            <input className="mt-1 w-full rounded-xl bg-[var(--muted)] border border-[var(--border)] px-3 py-2" placeholder="you@company.com"/>
          </div>
          <div>
            <label className="text-sm">Password</label>
            <input type="password" className="mt-1 w-full rounded-xl bg-[var(--muted)] border border-[var(--border)] px-3 py-2" placeholder="••••••••"/>
          </div>
          <button className="btn btn-gold w-full">Sign In</button>
        </form>
        <p className="text-center text-sm text-[var(--subtle)] mt-4">
          No account? <Link to="/signup" className="text-[var(--gold)]">Create one</Link>
        </p>
      </div>
    </div>
  )
}
