export default function Avatar({ name, src, size = 36 }: { name: string; src?: string; size?: number }) {
  const initials = (name || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return src ? (
    <img src={src} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover" />
  ) : (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-emerald-600/80 text-black flex items-center justify-center font-semibold"
    >
      {initials}
    </div>
  );
}
