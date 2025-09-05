// src/pages/dashboard/ShareRecords.tsx
import { useEffect, useState } from "react";
import { getJson } from "@/lib/api";

type RecordItem = { id: string; cardId: string; mode: string; at: string; roomId?: string | null; recipients?: string[]; senderId?: string };

export default function ShareRecords() {
  const [sent, setSent] = useState<RecordItem[]>([]);
  const [received, setReceived] = useState<RecordItem[]>([]);

  useEffect(() => {
    getJson("/api/shares/mine").then((r: any) => {
      setSent((r.sent || []).map((x: any) => ({ ...x, at: x.at })));
      setReceived((r.received || []).map((x: any) => ({ ...x, at: x.at })));
    });
  }, []);

  const Section = ({ title, items }: { title: string; items: RecordItem[] }) => (
    <div className="rounded-xl border border-[var(--border)] p-4 bg-[var(--card)]">
      <div className="font-semibold mb-2">{title}</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted">
            <th className="py-1">When</th>
            <th className="py-1">Card</th>
            <th className="py-1">Mode</th>
            <th className="py-1">Group/Recipients</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-t border-[var(--border)]">
              <td className="py-2">{new Date(it.at).toLocaleString()}</td>
              <td className="py-2">{it.cardId}</td>
              <td className="py-2 uppercase">{it.mode}</td>
              <td className="py-2">{it.roomId || (it.recipients?.length ? it.recipients.join(", ") : "—")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <Section title="Sent" items={sent} />
      <Section title="Received" items={received} />
    </div>
  );
}