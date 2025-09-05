import Avatar from "@/components/ui/Avatar";
type Room = { id: string; name: string; code: string; isAdmin?: boolean; members?: string[] };

export default function RoomList({
  rooms, activeId, onSelect, onSelectRoom,
}: {
  rooms: Room[]; activeId?: string;
  onSelect?: (r: Room) => void;
  onSelectRoom?: (r: Room) => void;
}) {
  const select = onSelectRoom || onSelect || (() => {});
  return (
    <div className="space-y-2">
      {rooms.map((r) => {
        const active = activeId === r.id;
        return (
          <button
            key={r.id}
            onClick={() => select(r)}
            className={`w-full rounded-xl px-3 py-2 flex items-center gap-3 border border-[var(--border)]
                        ${active ? "bg-white/10" : "bg-[#12161b] hover:bg-[#1a1f26]"}`}
          >
            <Avatar name={r.name} />
            <div className="flex-1 text-left">
              <div className="font-medium leading-5">{r.name}</div>
              <div className="text-[10px] text-[var(--subtle)]">No messages yet</div>
            </div>
            <span className="text-[10px] opacity-60">{(r.members || []).length || 1}</span>
          </button>
        );
      })}
    </div>
  );
}
