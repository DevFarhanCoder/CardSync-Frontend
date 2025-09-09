// src/pages/dashboard/ChatDirect.tsx
import React from "react";
import { useParams } from "react-router-dom";

export default function ChatDirect() {
  const { peerId } = useParams<{ peerId: string }>();

  // You can fetch the DM thread here:
  // const { messages } = await getJson(`/api/chat/direct/${peerId}`);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 p-4 text-sm text-neutral-200">
        Direct chat with <span className="font-semibold">{peerId}</span>
      </div>
      <div className="flex-1 p-6 text-sm text-neutral-400">No messages yet.</div>
      <div className="border-t border-white/10 p-4">
        <input
          placeholder="Type a message…"
          className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-neutral-100 placeholder:text-neutral-500"
        />
      </div>
    </div>
  );
}
