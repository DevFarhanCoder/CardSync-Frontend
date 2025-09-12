import React from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function Dashboard() {
  return (
    <div className="min-h-screen text-white p-6">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <img src="/logo-192.png" alt="logo" className="w-8 h-8"/>
          <h1 className="text-xl font-semibold">Instantlly-Cards</h1>
        </div>
        <button
          className="px-3 py-1 rounded bg-white/10"
          onClick={() => api.logout().then(() => (window.location.href = "/signin"))}
        >
          Logout
        </button>
      </header>

      <div className="space-y-4">
        <Link to="/dashboard/chat" className="inline-block rounded bg-yellow-500 text-black px-4 py-2">Go to Chat</Link>
      </div>
    </div>
  );
}