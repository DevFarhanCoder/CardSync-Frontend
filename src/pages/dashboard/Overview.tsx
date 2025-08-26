import { useEffect, useMemo, useState } from "react";
import { Eye, Share2, UserPlus, Activity } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const API = import.meta.env.VITE_API_BASE_URL;

type Totals = {
  totalViews: number;
  totalShares: number;
  newConnections: number;
  engagementScore: number;
};

type RecentItem = {
  id?: string;
  message?: string;
  createdAt?: string;
};

type OverviewRes = {
  totals: Totals;
  trend: number[];
  sharesTrend?: number[];
  conversionTrend?: number[];
  recentActivity: RecentItem[];
};

export default function Overview() {
  const { token } = useAuth();
  const [data, setData] = useState<OverviewRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();

    async function run() {
      if (!token) return;
      if (!API) {
        setErr("VITE_API_BASE_URL is not set");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErr(null);

      try {
        const res = await fetch(`${API}/v1/analytics/overview`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: ctrl.signal,
        });

        const text = await res.text();
        let payload: any = {};
        try {
          payload = JSON.parse(text);
        } catch {
          throw new Error(`Unexpected response (not JSON): ${text.slice(0, 120)}…`);
        }

        if (!res.ok) {
          throw new Error(payload?.error || payload?.message || `HTTP ${res.status}`);
        }

        const body = payload?.data ? payload.data : payload;

        const normalized: OverviewRes = {
          totals: {
            totalViews: Number(body?.totals?.totalViews ?? 0),
            totalShares: Number(body?.totals?.totalShares ?? 0),
            newConnections: Number(body?.totals?.newConnections ?? 0),
            engagementScore: Number(body?.totals?.engagementScore ?? 0),
          },
          trend: Array.isArray(body?.trend) ? body.trend : [],
          sharesTrend: Array.isArray(body?.sharesTrend) ? body.sharesTrend : undefined,
          conversionTrend: Array.isArray(body?.conversionTrend) ? body.conversionTrend : undefined,
          recentActivity: Array.isArray(body?.recentActivity) ? body.recentActivity : [],
        };

        setData(normalized);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          console.error("[Overview] load error →", e);
          setErr(e.message || "Failed to load overview");
        }
      } finally {
        setLoading(false);
      }
    }

    run();
    return () => ctrl.abort();
  }, [token]);

  const totals: Totals = useMemo(
    () => ({
      totalViews: data?.totals?.totalViews ?? 0,
      totalShares: data?.totals?.totalShares ?? 0,
      newConnections: data?.totals?.newConnections ?? 0,
      engagementScore: data?.totals?.engagementScore ?? 0,
    }),
    [data]
  );

  const viewsTrend = data?.trend ?? [];
  const sharesTrend = data?.sharesTrend ?? Array(viewsTrend.length).fill(0);
  const conversionTrend = data?.conversionTrend ?? movingAverage(viewsTrend, 5);

  const zeroState =
    totals.totalViews === 0 && totals.totalShares === 0 && totals.newConnections === 0;

  return (
    <div className="space-y-6 min-w-0">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Views" value={totals.totalViews} icon={<Eye size={18} />} />
        <KpiCard label="Total Shares" value={totals.totalShares} icon={<Share2 size={18} />} />
        <KpiCard label="New Connections" value={totals.newConnections} icon={<UserPlus size={18} />} />
        <KpiCard label="Engagement Score" value={totals.engagementScore} icon={<Activity size={18} />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Views">
          <SparkBars values={viewsTrend} />
        </ChartCard>
        <ChartCard title="Shares">
          <SparkBars values={sharesTrend} />
        </ChartCard>
        <ChartCard title="Conversion Trend">
          <SparkLine values={conversionTrend} />
        </ChartCard>
      </div>

      {/* Recent Activity */}
      <div className="card p-5 overflow-x-auto">
        <h3 className="text-base font-semibold mb-3">Recent Activity</h3>

        {loading && (
          <ul className="space-y-2 text-[var(--subtle)]">
            <li className="h-4 w-1/2 bg-white/5 rounded" />
            <li className="h-4 w-2/3 bg-white/5 rounded" />
            <li className="h-4 w-1/3 bg-white/5 rounded" />
          </ul>
        )}

        {!loading && err && (
          <div className="text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-3 py-2 text-sm">
            {err}
          </div>
        )}

        {!loading && !err && (
          <>
            {zeroState && (!data?.recentActivity?.length || data.recentActivity.length === 0) ? (
              <div className="text-[var(--subtle)] text-sm">
                No activity yet. Create your first card and share it to start seeing views, shares, and
                connection stats here.
              </div>
            ) : (
              <ul className="list-disc list-inside space-y-1 text-sm">
                {(data?.recentActivity ?? []).map((a, idx) => (
                  <li key={a.id || idx}>
                    {a.message || "Activity"}{" "}
                    <span className="text-[var(--subtle)]">
                      {a.createdAt ? "· " + formatWhen(a.createdAt) : null}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- UI Partials ----------------------------- */

function KpiCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-[var(--subtle)] text-sm">{label}</span>
        <span className="text-[var(--subtle)]">{icon}</span>
      </div>
      <div className="mt-2 text-3xl font-semibold">{formatNumber(value)}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5 min-h-[180px]">
      <div className="text-sm mb-3">{title}</div>
      <div className="h-40">{children}</div>
    </div>
  );
}

/* ----------------------------- Tiny Charts ----------------------------- */

function SparkBars({
  values,
  height = 150,
  gap = 3,
  padding = 6,
}: {
  values: number[];
  height?: number;
  gap?: number;
  padding?: number;
}) {
  const safe = values && values.length > 0 ? values : [0];
  const max = Math.max(...safe, 1);
  const barW = 6;
  const width = padding * 2 + safe.length * barW + (safe.length - 1) * gap;
  const yScale = (v: number) => (v / max) * (height - padding * 2);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      {safe.map((v, i) => {
        const h = yScale(v);
        const x = padding + i * (barW + gap);
        const y = height - padding - h;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={Math.max(h, 1)}
            rx={2}
            className="fill-[var(--gold)]"
          />
        );
      })}
      <line
        x1={0}
        x2={width}
        y1={height - padding}
        y2={height - padding}
        className="stroke-white/10"
        strokeWidth={1}
      />
    </svg>
  );
}

function SparkLine({
  values,
  height = 150,
  padding = 8,
}: {
  values: number[];
  height?: number;
  padding?: number;
}) {
  const safe = values && values.length > 0 ? values : [0];
  const max = Math.max(...safe, 1);
  const width = 300;
  const stepX = (width - padding * 2) / Math.max(safe.length - 1, 1);
  const scaleY = (v: number) => {
    const h = (v / max) * (height - padding * 2);
    return height - padding - h;
  };

  const pts = safe.map((v, i) => `${padding + i * stepX},${scaleY(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <polyline
        points={pts}
        fill="none"
        stroke="var(--gold)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <line
        x1={0}
        x2={width}
        y1={height - padding}
        y2={height - padding}
        className="stroke-white/10"
        strokeWidth={1}
      />
    </svg>
  );
}

/* ----------------------------- Utils ----------------------------- */

function movingAverage(arr: number[], window: number) {
  if (!arr || arr.length === 0) return [];
  const out: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    const s = Math.max(0, i - window + 1);
    const chunk = arr.slice(s, i + 1);
    const sum = chunk.reduce((a, b) => a + b, 0);
    out.push(Math.round((sum / chunk.length) * 100) / 100);
  }
  return out;
}

function formatNumber(n: number) {
  try {
    return new Intl.NumberFormat().format(n);
  } catch {
    return String(n);
  }
}

function formatWhen(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}
