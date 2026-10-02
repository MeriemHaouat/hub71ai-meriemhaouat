"use client";

import { TYPE_COLORS, TYPE_LABELS, type Report } from "@/lib/types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function Feed({
  reports,
  newestId,
}: {
  reports: Report[];
  newestId: string | null;
}) {
  if (reports.length === 0) {
    return (
      <p className="px-1 py-6 text-sm text-neutral-400">
        No reports yet. Send Rafiki a tip to drop the first pin.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {reports.map((r) => (
        <li
          key={r.id}
          className={`rounded-xl border px-3 py-2.5 transition ${
            r.id === newestId ? "border-black bg-neutral-50" : "border-neutral-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide"
              style={{ color: TYPE_COLORS[r.type] ?? TYPE_COLORS.other }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: TYPE_COLORS[r.type] ?? TYPE_COLORS.other }}
              />
              {TYPE_LABELS[r.type] ?? "Tip"}
            </span>
            <span className="text-xs text-neutral-400">{timeAgo(r.created_at)}</span>
          </div>
          <div className="mt-1 text-sm text-black">{r.detail}</div>
          <div className="mt-0.5 text-xs text-neutral-500">{r.area}</div>
        </li>
      ))}
    </ul>
  );
}
