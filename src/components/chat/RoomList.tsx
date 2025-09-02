import Avatar from "@/components/ui/Avatar";

export type Room = {
  id: string;
  name: string;
  membersCount: number;
  isAdmin: boolean;
  code?: string;
  createdAt?: string | number | Date;
  lastMessage?: string;
  lastAt?: number;
  photoURL?: string;           // NEW
  description?: string;        // NEW
};

export default function RoomList({
  rooms,
  activeId,
  onSelectRoom,
}: {
  rooms: Room[];
  activeId: string | null;
  onSelectRoom: (roomId: string) => void;
}) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="px-3 pt-2 pb-1 text-xs uppercase text-zinc-400">Groups</div>
      {rooms.map((r) => (
        <button
          key={r.id}
          className={`w-full flex items-center gap-3 px-3 py-2 cursor-pointer rounded-lg ${
            activeId === r.id ? "bg-zinc-800" : "hover:bg-zinc-800/70"
          }`}
          onClick={() => onSelectRoom(r.id)}
        >
          <Avatar name={r.name} src={r.photoURL} />
          <div className="min-w-0 flex-1 text-left">
            <div className="flex items-center justify-between">
              <div className="font-medium text-zinc-100 truncate">{r.name}</div>
              <div className="text-[10px] text-zinc-500 ml-2">
                {r.membersCount ?? 1}
              </div>
            </div>
            <div className="text-xs text-zinc-400 truncate">
              {r.lastMessage || "No messages yet"}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
