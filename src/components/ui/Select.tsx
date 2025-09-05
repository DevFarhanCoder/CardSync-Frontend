import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type Option = { value: string; label: string };

export default function Select({
  value,
  onChange,
  options,
  placeholder = "-- choose --",
  className = "",
  disabled = false,
}: {
  value?: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const label = selected?.label || placeholder;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !listRef.current?.contains(t)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`w-full rounded-xl border px-3 py-2 text-left
          bg-[#1b1f26] hover:bg-[#222833] focus:outline-none
          border-[var(--border)] ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center justify-between">
          <span className={`${selected ? "text-white" : "text-[var(--subtle)]"}`}>{label}</span>
          <ChevronDown size={16} className="opacity-70" />
        </div>
      </button>

      {open && (
        <div
          ref={listRef}
          className="absolute z-50 mt-2 w-full max-h-64 overflow-auto rounded-xl border border-[var(--border)]
                     bg-[#12161b] shadow-xl"
        >
          {options.length === 0 && (
            <div className="px-3 py-2 text-[var(--subtle)] text-sm">No options</div>
          )}
          {options.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                className={`w-full text-left px-3 py-2
                            hover:bg-yellow-500/10 hover:text-yellow-400
                            ${active ? "bg-yellow-500/15 text-yellow-400" : ""}`}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
