import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DeleteAccount() {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [reason, setReason] = useState("");
    const [confirm, setConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState<null | "ok" | "err">(null);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!confirm) return;
        try {
            setSubmitting(true);
            setDone(null);

            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/account-deletion`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullName, email, reason, source: "web" }),
            });

            if (!res.ok) throw new Error("Failed");

            // ✅ Redirect after success
            setDone("ok");
            setTimeout(() => {
                navigate("/", { replace: true }); // redirect to homepage
            }, 2000); // wait 2s so they see success message briefly

        } catch {
            setDone("err");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="mx-auto max-w-3xl px-6 py-10 bg-gray-900 text-gray-300 min-h-screen">
            <h1 className="text-3xl font-bold text-white mb-3">Delete Your Instantly Cards Account</h1>
            <p className="mb-6">
                Use this page to request deletion of your <strong>Instantly Cards</strong> account and associated data.
            </p>

            <section className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-3">How it works</h2>
                <ol className="list-decimal ml-6 space-y-1">
                    <li>Submit the request below (or email <a className="text-blue-400 underline" href="mailto:support@instantlycards.com">support@instantlycards.com</a>).</li>
                    <li>We verify ownership via your registered email.</li>
                    <li>Once verified, we delete your account and data within <strong>7 business days</strong>.</li>
                </ol>
            </section>

            <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-200">Full name</label>
                    <input className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-800 text-white p-2 placeholder-gray-400" value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-200">Registered email</label>
                    <input type="email" className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-800 text-white p-2 placeholder-gray-400" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-200">Reason (optional)</label>
                    <textarea className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-800 text-white p-2 placeholder-gray-400" rows={4} value={reason} onChange={e => setReason(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                    <input id="confirm" type="checkbox" checked={confirm} onChange={e => setConfirm(e.target.checked)} />
                    <label htmlFor="confirm" className="text-sm text-gray-200">
                        I understand this is permanent and may remove my saved cards, profile and messages.
                    </label>
                </div>

                <button
                    disabled={!confirm || submitting}
                    className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                >
                    {submitting ? "Submitting..." : "Request Account Deletion"}
                </button>

                {done === "ok" && (
                    <div className="mt-4 p-3 rounded bg-green-600 text-white">
                        ✅ Request received! We’ve sent a confirmation email.
                    </div>
                )}
                {done === "err" && (
                    <div className="mt-4 p-3 rounded bg-red-600 text-white">
                        ❌ Couldn’t submit. Please try again or email support.
                    </div>
                )}
            </form>
        </main>

    );
}
