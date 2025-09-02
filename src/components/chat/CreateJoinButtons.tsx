/* src/components/chat/CreateJoinButtons.tsx */
type Props = {
  onCreate: () => void;
  onJoin: () => void;
};
export default function CreateJoinButtons({ onCreate, onJoin }: Props) {
  return (
    <div className="flex gap-2">
      <button
        className="rounded-full bg-yellow-400 px-4 py-2 font-medium text-black hover:opacity-90"
        onClick={onCreate}
      >
        + Create Room
      </button>
      <button
        className="rounded-full bg-zinc-700 px-4 py-2 font-medium text-white hover:bg-zinc-600"
        onClick={onJoin}
      >
        ↳ Join Room
      </button>
    </div>
  );
}
