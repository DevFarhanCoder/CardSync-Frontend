
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function DirectChat() {
  const { id } = useParams();
  const nav = useNavigate();

  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col bg-[#0d1117] text-neutral-100">
      <div className="flex h-12 items-center gap-2 border-b border-white/10 px-3">
        <button onClick={() => nav(-1)} className="rounded-full p-1.5 hover:bg-white/10">
          <ArrowLeft className="h-5 w-5 text-neutral-300" />
        </button>
        <div className="text-sm font-medium">Direct chat</div>
      </div>
      <div className="flex-1 overflow-auto p-3 text-sm text-neutral-400">DM room id: {id}. (Message list will go here.)</div>
      <div className="border-t border-white/10 p-3">
        <input placeholder="Type a message…" className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-neutral-100 placeholder:text-neutral-500" />
      </div>
    </div>
  );
}
