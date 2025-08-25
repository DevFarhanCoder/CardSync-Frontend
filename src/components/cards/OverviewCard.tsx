import React from "react";

type CardData = {
  logo?: string;
  name?: string;
  tagline?: string;
  phone?: string;
  email?: string;
  website?: string;
  badge?: string;     // e.g., "Business"
  location?: string;  // e.g., "India"
};

export default function OverviewCard({
  data,
  theme = "luxe",
  className = "",
}: {
  data: CardData;
  theme?: string;
  className?: string;
}) {
  return (
    <div
      className={
        "rounded-2xl shadow-[0_10px_24px_rgba(0,0,0,0.35)] " +
        "bg-gradient-to-b from-[#0f1420] to-[#0c1017] " +
        "border border-[#1f2430] p-4 sm:p-5 w-[360px] " + className
      }
    >
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-white/70">
          {data.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.logo} alt="logo" className="w-full h-full object-cover rounded-xl" />
          ) : (
            "LOGO"
          )}
        </div>

        {/* Identity */}
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-white font-semibold leading-tight">{data.name || "—"}</div>
              {data.tagline && (
                <div className="text-[12px] text-white/60 mt-[2px]">{data.tagline}</div>
              )}
            </div>

            {data.badge && (
              <span className="text-[10px] px-2 py-[3px] rounded-full bg-indigo-600/30 text-indigo-200 border border-indigo-500/40">
                {data.badge}
              </span>
            )}
          </div>

          {/* Contact */}
          <div className="mt-3 space-y-1 text-[12px] text-white/80">
            {data.phone && <div>{data.phone}</div>}
            {data.email && <div>{data.email}</div>}
            {data.website && <div className="text-white/70">{data.website}</div>}
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-white/50">{data.location}</span>

            {data.website && (
              <a
                className="text-[11px] px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80 inline-flex items-center gap-1 hover:bg-white/10"
                href={data.website.startsWith("http") ? data.website : `https://${data.website}`}
                target="_blank"
                rel="noreferrer"
              >
                <span className="i">🌐</span> website
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
