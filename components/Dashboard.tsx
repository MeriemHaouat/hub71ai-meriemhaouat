"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Sparkles, MapPin, MessageCircle } from "lucide-react";
import Composer from "./Composer";
import Feed from "./Feed";
import { browserSupabase } from "@/lib/supabase";
import { REPORT_TYPES, TYPE_COLORS, TYPE_LABELS, type Report } from "@/lib/types";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-upfleet-section-alt text-[0.875rem] text-upfleet-tertiary">
      Loading map…
    </div>
  ),
});

const WHATSAPP_DISPLAY = "+971 58 572 6739";
const WHATSAPP_LINK = "https://wa.me/971585726739";

export default function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [newestId, setNewestId] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  const addReport = useCallback((r: Report) => {
    setReports((prev) => (prev.some((x) => x.id === r.id) ? prev : [r, ...prev]));
    setNewestId(r.id);
  }, []);

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
    <div className="min-h-screen">
      {/* Header — Upfleet frosted bar */}
      <header className="sticky top-0 z-[1100] flex h-14 items-center justify-between border-b border-upfleet-border bg-white/80 px-5 backdrop-blur-xl lg:px-8">
        <div className="flex items-baseline gap-2.5">
          <span className="font-heading text-[1.25rem] font-extrabold italic tracking-brand text-upfleet-dark">
            RAFIKI
          </span>
          <span className="font-heading text-[1rem] text-upfleet-secondary">رفيقي</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden items-center gap-1.5 text-[0.75rem] text-upfleet-secondary sm:inline-flex">
            <span
              className={`h-1.5 w-1.5 rounded-full ${live ? "animate-pulse bg-upfleet-positive" : "bg-upfleet-tertiary"}`}
            />
            {live ? "live" : "connecting"}
          </span>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-upfleet-dark px-3.5 py-1.5 text-[0.75rem] font-medium text-white tracking-brand transition-colors hover:bg-[#1a1d24]"
          >
            <MessageCircle size={13} strokeWidth={2} /> {WHATSAPP_DISPLAY}
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-6 px-5 py-6 lg:px-8 lg:py-7">
        {/* Hero — Abu Dhabi skyline */}
        <section className="animate-fade-up relative overflow-hidden rounded-2xl border border-upfleet-border shadow-premium">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/abu-dhabi-skyline.png)" }}
            aria-hidden
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(100deg, rgba(11,13,16,0.92) 0%, rgba(11,13,16,0.72) 42%, rgba(11,13,16,0.25) 100%)",
            }}
            aria-hidden
          />
          <div className="relative px-6 py-9 lg:px-10 lg:py-12">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-upfleet-yellow">
              Welcome to Abu Dhabi
            </span>
            <h1 className="mt-3 max-w-xl font-heading text-[2rem] font-semibold leading-[1.1] tracking-brand-tight text-white lg:text-[2.6rem]">
              Meet Rafiki, your companion for the city.
            </h1>
            <p className="mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-white/80">
              New here? Message Rafiki on WhatsApp. Every tip the community shares —
              real rents, scam numbers, trusted landlords, the nearest clinic — lands
              on a living map that makes the city easier for the next person.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-[10px] bg-white px-5 py-2.5 text-[0.8125rem] font-semibold text-upfleet-dark tracking-brand transition-all duration-200 hover:-translate-y-px hover:shadow-premium"
              >
                <MessageCircle size={15} strokeWidth={2} /> Chat with Rafiki
              </a>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-[0.75rem] font-medium text-white backdrop-blur">
                <Sparkles size={14} strokeWidth={1.75} className="text-upfleet-yellow" />
                Built by newcomers, for the next one
              </span>
            </div>
          </div>
        </section>

        {/* Two-column working area */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left — talk + feed */}
          <div className="animate-fade-up space-y-6 lg:col-span-5">
            <section className="rounded-2xl border border-upfleet-border bg-white p-5 shadow-card lg:p-6">
              <div className="mb-4 flex items-center gap-2">
                <MessageCircle size={18} strokeWidth={1.75} className="text-upfleet-dark" />
                <h2 className="font-heading text-[1.0625rem] font-semibold tracking-brand text-upfleet-dark">
                  Talk to Rafiki
                </h2>
              </div>
              <Composer onNewReport={addReport} />
            </section>

            <section className="rounded-2xl border border-upfleet-border bg-white p-5 shadow-card lg:p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-heading text-[1.0625rem] font-semibold tracking-brand text-upfleet-dark">
                  Community reports
                </h2>
                <span className="rounded-full bg-upfleet-section-alt px-2.5 py-0.5 text-[0.6875rem] font-semibold text-upfleet-secondary tabular-nums">
                  {reports.length}
                </span>
              </div>
              <Feed reports={reports} newestId={newestId} />
            </section>
          </div>

          {/* Right — map */}
          <div className="animate-fade-up lg:col-span-7">
            <section className="overflow-hidden rounded-2xl border border-upfleet-border bg-white shadow-card lg:sticky lg:top-[5.25rem]">
              <div className="flex items-center justify-between border-b border-upfleet-border px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <MapPin size={18} strokeWidth={1.75} className="text-upfleet-dark" />
                  <h2 className="font-heading text-[1.0625rem] font-semibold tracking-brand text-upfleet-dark">
                    Living map of Abu Dhabi
                  </h2>
                </div>
                <div className="hidden flex-wrap gap-x-3 gap-y-1 sm:flex">
                  {legend.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 text-[0.6875rem] text-upfleet-secondary"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: TYPE_COLORS[t] }}
                      />
                      {TYPE_LABELS[t]}
                    </span>
                  ))}
                </div>
              </div>
              <div className="h-[440px] w-full lg:h-[620px]">
                <MapView reports={reports} newestId={newestId} />
              </div>
            </section>
          </div>
        </div>

        <footer className="pb-4 pt-2 text-center text-[0.75rem] text-upfleet-tertiary">
          Rafiki · a community companion for Abu Dhabi
        </footer>
      </main>
    </div>
  );
}
