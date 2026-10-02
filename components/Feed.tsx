"use client";

import { ShieldAlert, Home, Building2, Stethoscope, Info } from "lucide-react";
import { TYPE_COLORS, TYPE_LABELS, type Report, type ReportType } from "@/lib/types";

const ICON: Record<ReportType, typeof Info> = {
  scam: ShieldAlert,
  rent: Home,
  landlord: Building2,
  clinic: Stethoscope,
  other: Info,
};

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
      <p className="px-1 py-8 text-center text-[0.875rem] text-upfleet-tertiary">
        No reports yet. Send Rafiki a tip to drop the first pin.
      </p>
    );
  }

  return (
    <ul className="space-y-2.5">
      {reports.map((r) => {
        const color = TYPE_COLORS[r.type] ?? TYPE_COLORS.other;
        const Icon = ICON[r.type] ?? Info;
        const isNew = r.id === newestId;
        return (
          <li
            key={r.id}
            className={`rounded-xl border bg-white px-4 py-3 transition-all ${
              isNew
                ? "border-upfleet-dark shadow-card-hover"
                : "border-upfleet-border shadow-card hover:shadow-card-hover"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em]"
                style={{ color, backgroundColor: `${color}14` }}
              >
                <Icon size={12} strokeWidth={2} />
                {TYPE_LABELS[r.type] ?? "Tip"}
              </span>
              <span className="text-[0.6875rem] text-upfleet-tertiary tabular-nums">
                {timeAgo(r.created_at)}
              </span>
            </div>
            <p className="mt-2 text-[0.875rem] leading-snug text-upfleet-body">{r.detail}</p>
            <p className="mt-1 text-[0.75rem] text-upfleet-secondary">{r.area}</p>
          </li>
        );
      })}
    </ul>
  );
}
