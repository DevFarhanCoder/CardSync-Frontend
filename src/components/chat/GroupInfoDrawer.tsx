import Avatar from "@/components/ui/Avatar";
import { useRef } from "react";

type Member = { userId: string; name?: string; role?: "admin" | "member" };

export default function GroupInfoDrawer({
  isOpen,
  onClose,
  room,
  members,
  currentUserId,
  onMakeAdmin,
  onRemoveFromGroup,
  onLeaveGroup,
  onOpenDM,
  onCopyCode,
  onInviteByPhone,
  onRename,
  onDeleteGroup,
  onUpdateDescription,
  onUploadPhoto,
  onOpenDetails, // NEW
}: {
  isOpen: boolean;
  onClose: () => void;
  room: {
    id: string; name: string; createdBy?: string;
    createdAt?: number | string; code?: string; isAdmin?: boolean;
    description?: string; photoURL?: string;
  };
  members: Member[];
  currentUserId: string | null;
  onMakeAdmin: (userId: string) => void;
  onRemoveFromGroup: (userId: string) => void;
  onLeaveGroup: () => void;
  onOpenDM: (userId: string) => void;
  onCopyCode: () => void;
  onInviteByPhone: () => void;
  onRename: () => void;
  onDeleteGroup: () => void;
  onUpdateDescription: (desc: string) => void;
  onUploadPhoto: (file: File) => void;
  onOpenDetails: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[180]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-[400px] border-l border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Avatar name={room.name} src={room.photoURL} size={40} />
            <div>
              <div className="text-lg font-semibold text-white">{room.name}</div>
              {room.createdAt && (
                <div className="text-xs text-zinc-400">Created: {new Date(room.createdAt).toLocaleString()}</div>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400">✕</button>
        </div>

        <div className="px-4 py-4 space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="file" accept="image/*" ref={fileRef} className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUploadPhoto(f);
              }}
            />
            <button
              className="rounded-lg bg-zinc-800 px-3 py-2 text-sm"
              onClick={() => fileRef.current?.click()}
            >
              Upload profile photo
            </button>

            <button className="rounded-lg bg-zinc-800 px-3 py-2 text-sm" onClick={onOpenDetails}>
              Details (Media, Docs, Links)
            </button>
          </div>

          <div>
            <div className="text-xs uppercase text-zinc-400 mb-1">Room code</div>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center rounded-lg bg-zinc-800 px-3 py-1.5 text-sm">
                {room.code || "—"}
              </div>
              <button className="rounded-md border border-zinc-700 px-2 py-1 text-xs hover:bg-zinc-800" onClick={onCopyCode}>
                Copy
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase text-zinc-400 mb-1">Description</div>
            <textarea
              defaultValue={room.description || ""}
              onBlur={(e) => onUpdateDescription(e.target.value)}
              placeholder="Add a group description…"
              className="w-full min-h-[80px] rounded-lg bg-zinc-800 p-2 outline-none"
            />
          </div>

          <div className="flex gap-2">
            {room.isAdmin && (
              <>
                <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-black"
                        onClick={onInviteByPhone}>
                  + Add by phone
                </button>
                <button className="rounded-lg bg-zinc-800 px-3 py-2 text-sm" onClick={onRename}>Rename group</button>
                <button className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white" onClick={onDeleteGroup}>
                  Delete group
                </button>
              </>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-800">
            <div className="text-xs uppercase text-zinc-400 mb-2">
              Members • {members.length}
            </div>
            <ul className="space-y-2">
              {members.map((m) => (
                <li key={m.userId} className="flex items-center justify-between">
                  <button onClick={() => onOpenDM(m.userId)} className="text-zinc-200 hover:underline">
                    {m.name || m.userId}
                    {m.role === "admin" && (
                      <span className="ml-2 text-[10px] rounded bg-zinc-700 px-2 py-0.5">admin</span>
                    )}
                  </button>
                  {room.isAdmin && currentUserId !== m.userId && (
                    <div className="flex gap-2">
                      {m.role !== "admin" && (
                        <button className="text-xs text-emerald-400" onClick={() => onMakeAdmin(m.userId)}>Make admin</button>
                      )}
                      <button className="text-xs text-red-400" onClick={() => onRemoveFromGroup(m.userId)}>Remove</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-zinc-800 pt-3">
            <button className="text-red-400 text-sm" onClick={onLeaveGroup}>Leave group</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
