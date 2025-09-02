type Item = {
  id: string;
  roomId: string;
  userId: string;
  userName?: string;
  text: string;
  createdAt: number;
};

export default function MessageList({
  items,
  currentUserId,
}: {
  items: Item[];
  currentUserId: string | null;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[var(--bg)]">
      {items.map((m) => {
        const mine = currentUserId && m.userId === currentUserId;
        return (
          <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[72%] rounded-2xl px-3 py-2 shadow-sm
              ${mine ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-100"}`}
            >
              <div className="text-sm whitespace-pre-wrap break-words">{m.text}</div>
              <div className={`mt-1 text-[10px] ${mine ? "text-black/70" : "text-zinc-400"}`}>
                {new Date(m.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
