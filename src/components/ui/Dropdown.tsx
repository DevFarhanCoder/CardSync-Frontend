import { useEffect, useRef, useState } from "react";

export default function Dropdown({
  trigger,
  items,
  align = "right",
}: {
  trigger: React.ReactNode;
  items: { label: string; onClick: () => void; danger?: boolean; disabled?: boolean }[];
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)}>{trigger}</button>
      {open && (
        <div
          className={`absolute mt-2 min-w-48 rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl ${
            align === "right" ? "right-0" : "left-0"
          } z-[150]`}
        >
          {items.map((it, i) => (
            <button
              key={i}
              disabled={!!it.disabled}
              onClick={() => {
                setOpen(false);
                it.onClick();
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-zinc-800/70 first:rounded-t-xl last:rounded-b-xl ${
                it.danger ? "text-red-400 hover:text-red-300" : ""
              } ${it.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
