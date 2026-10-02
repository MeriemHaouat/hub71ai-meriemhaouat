"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import Composer from "./Composer";
import Feed from "./Feed";
import { browserSupabase } from "@/lib/supabase";
import { REPORT_TYPES, TYPE_COLORS, TYPE_LABELS, type Report } from "@/lib/types";

// Leaflet touches `window`, so load the map only on the client.
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-sm text-neutral-400">
      Loading map…
    </div>
  ),
});

const WHATSAPP_NUMBER = "+971 58 572 6739";

export default function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [newestId, setNewestId] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  const addReport = useCallback((r: Report) => {
    setReports((prev) => {
      if (prev.some((x) => x.id === r.id)) return prev; // dedupe
      return [r, ...prev];
    });
    setNewestId(r.id);
  }, []);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    fetch("/api/reports")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data.reports)) setReports(data.reports);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Realtime: new pins appear live as the community reports them
  useEffect(() => {
    const sb = browserSupabase();
    if (!sb) return;
    const channel = sb
      .channel("reports-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reports" },
        (payload) => addReport(payload.new as Report),
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => {
      sb.removeChannel(channel);
    };
  }, [addReport]);

  const legend = useMemo(() => REPORT_TYPES.filter((t) => t !== "other"), []);

  return (
    <div className="flex h-screen flex-col lg:flex-row">
      {/* Map */}
      <div className="relative h-[45vh] w-full lg:h-full lg:flex-1">
        <MapView reports={reports} newestId={newestId} />
        {/* Legend overlay */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] rounded-xl bg-white/90 px-3 py-2 text-xs shadow-md backdrop-blur">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {legend.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: TYPE_COLORS[t] }}
                />
                {TYPE_LABELS[t]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="flex h-[55vh] w-full flex-col border-t border-neutral-200 lg:h-full lg:w-[420px] lg:border-l lg:border-t-0">
        <header className="border-b border-neutral-200 px-5 py-4">
          <div className="flex items-baseline justify-between">
            <h1 className="text-xl font-semibold tracking-tight">
              Rafiki <span className="text-neutral-400">·</span>{" "}
              <span className="font-normal">رفيقي</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
              <span
                className={`h-2 w-2 rounded-full ${live ? "bg-rent" : "bg-neutral-300"}`}
              />
              {live ? "live" : "offline"}
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            Your companion for Abu Dhabi. Text{" "}
            <span className="font-medium text-black">{WHATSAPP_NUMBER}</span> — every
            tip builds the map.
          </p>
        </header>

        <div className="border-b border-neutral-200 px-5 py-4">
          <Composer onNewReport={addReport} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Community reports
          </h2>
          <Feed reports={reports} newestId={newestId} />
        </div>
      </aside>
    </div>
  );
}
