/* src/components/chat/MessageInput.tsx */
import { useState } from "react";

export default function MessageInput({
  disabled,
  onSend,
}: {
  disabled?: boolean;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const send = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };
  return (
    <div className="flex items-center gap-2 p-3 border-t border-[var(--border)]">
      <input
        className="flex-1 rounded-lg bg-zinc-900 px-3 py-2 outline-none"
        placeholder="Type a message…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
        disabled={disabled}
      />
      <button
        className="rounded-lg bg-yellow-400 text-black px-4 py-2 font-medium disabled:opacity-50"
        onClick={send}
        disabled={disabled}
      >
        Send
      </button>
    </div>
  );
}
