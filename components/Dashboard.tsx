"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  MapPin,
  MessageCircle,
  ShieldAlert,
  ClipboardList,
  Users,
  CalendarDays,
  X,
} from "lucide-react";
import Feed from "./Feed";
import { browserSupabase } from "@/lib/supabase";
import { REPORT_TYPES, TYPE_COLORS, TYPE_LABELS, type Report } from "@/lib/types";
import listingsData from "@/data/listings.json";
import communitiesData from "@/data/communities.json";

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
const waWith = (text: string) => `${WHATSAPP_LINK}?text=${encodeURIComponent(text)}`;

const HELP = [
  { icon: ClipboardList, title: "Ask how to settle in", body: "Emirates ID, Tawtheeq tenancy, bank, SIM, licence — step by step, with official sources." },
  { icon: Users, title: "Get connected to people", body: "Looking for a flat, office, car or a nanny? Rafiki connects you to real people who posted offers." },
  { icon: ShieldAlert, title: "Avoid the scams", body: "Newcomers flag scam numbers and bad landlords so you don't fall for them." },
];

interface CommunityEvent {
  when: string;
  title: string;
  where: string;
}
interface Community {
  emoji: string;
  name: string;
  note: string;
  members: number;
  blurb: string;
  events: CommunityEvent[];
}

const COMMUNITIES = communitiesData as Community[];
const OFFERS = (listingsData as any[]).slice(0, 8);

export default function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [newestId, setNewestId] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [openCommunity, setOpenCommunity] = useState<Community | null>(null);

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

  const ticker = useMemo(() => {
    const fromReports = reports.slice(0, 12).map((r) => ({
      label: TYPE_LABELS[r.type] ?? "Tip",
      text: r.detail,
      area: r.area,
      color: TYPE_COLORS[r.type] ?? TYPE_COLORS.other,
    }));
    const fromOffers = OFFERS.map((o) => ({
      label: o.category,
      text: o.title,
      area: o.area,
      color: TYPE_COLORS.other,
    }));
    return [...fromReports, ...fromOffers].slice(0, 18);
  }, [reports]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-[1100] flex h-14 items-center justify-between border-b border-upfleet-border bg-white/80 px-5 backdrop-blur-xl lg:px-8">
        <div className="flex items-baseline gap-2.5">
          <span className="font-heading text-[1.25rem] font-extrabold italic tracking-brand text-upfleet-dark">RAFIKI</span>
          <span className="font-heading text-[1rem] text-upfleet-secondary">رفيقي</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden items-center gap-1.5 text-[0.75rem] text-upfleet-secondary sm:inline-flex">
            <span className={`h-1.5 w-1.5 rounded-full ${live ? "animate-pulse bg-upfleet-positive" : "bg-upfleet-tertiary"}`} />
            {live ? "live" : "connecting"}
          </span>
          <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-upfleet-dark px-3.5 py-1.5 text-[0.75rem] font-medium text-white tracking-brand transition-colors hover:bg-[#1a1d24]">
            <MessageCircle size={13} strokeWidth={2} /> {WHATSAPP_DISPLAY}
          </a>
        </div>
      </header>

      {/* Full-bleed hero */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/abu-dhabi-skyline.png)" }} aria-hidden />
        <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(11,13,16,0.92) 0%, rgba(11,13,16,0.70) 40%, rgba(11,13,16,0.18) 100%)" }} aria-hidden />
        <div className="relative mx-auto max-w-[1400px] px-5 py-14 lg:px-8 lg:py-20">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-upfleet-yellow">Welcome to Abu Dhabi</span>
          <h1 className="mt-3 max-w-2xl font-heading text-[2.1rem] font-semibold leading-[1.08] tracking-brand-tight text-white lg:text-[3rem]">
            Your companion for moving to, settling in, and building a future here.
          </h1>
          <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-white/80 lg:text-[1.0625rem]">
            Message Rafiki on WhatsApp. He walks you through the official steps, and
            connects you to a real community network — people with apartments, offices,
            cars and services to offer, right now.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[10px] bg-white px-5 py-3 text-[0.875rem] font-semibold text-upfleet-dark tracking-brand transition-all duration-200 hover:-translate-y-px hover:shadow-premium">
              <MessageCircle size={16} strokeWidth={2} /> Chat with Rafiki on WhatsApp
            </a>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-[0.75rem] font-medium text-white backdrop-blur">
              <Sparkles size={14} strokeWidth={1.75} className="text-upfleet-yellow" /> Built by newcomers, for the next one
            </span>
          </div>
        </div>
      </section>

      {/* Live updates ticker */}
      {ticker.length > 0 && (
        <section className="border-b border-upfleet-border bg-white">
          <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-5 lg:px-8">
            <span className="flex shrink-0 items-center gap-1.5 py-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-upfleet-dark">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-upfleet-positive" />
              Live updates
            </span>
            <div className="relative flex-1 overflow-hidden">
              <div className="flex w-max animate-marquee gap-7 whitespace-nowrap py-2.5">
                {[...ticker, ...ticker].map((it, i) => (
                  <span key={i} className="inline-flex items-center gap-2 text-[0.75rem] text-upfleet-secondary">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: it.color }} />
                    <span className="font-semibold text-upfleet-dark">{it.label}</span>
                    <span>{it.text}</span>
                    <span className="text-upfleet-tertiary">· {it.area}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <main className="mx-auto max-w-[1400px] space-y-10 px-5 py-10 lg:px-8">
        {/* Scan to chat */}
        <section className="flex flex-col items-center gap-5 rounded-2xl border border-upfleet-border bg-white p-5 shadow-card sm:flex-row sm:p-6">
          <img
            src="/rafiki-qr.png"
            alt="Scan to chat with Rafiki on WhatsApp"
            className="h-28 w-28 shrink-0 rounded-xl border border-upfleet-border"
          />
          <div className="text-center sm:text-left">
            <h2 className="font-heading text-[1.0625rem] font-semibold tracking-brand text-upfleet-dark">
              Try Rafiki now — scan to chat
            </h2>
            <p className="mt-1 text-[0.8125rem] text-upfleet-secondary">
              Point your camera at the code to open WhatsApp, or message{" "}
              <span className="font-medium text-upfleet-dark">{WHATSAPP_DISPLAY}</span>.
            </p>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-[10px] bg-upfleet-dark px-5 py-2.5 text-[0.8125rem] font-medium text-white tracking-brand transition-all duration-200 hover:-translate-y-px hover:bg-[#1a1d24] hover:shadow-premium"
            >
              <MessageCircle size={15} strokeWidth={2} /> Chat with Rafiki
            </a>
          </div>
        </section>

        {/* How Rafiki helps */}
        <section className="grid gap-4 sm:grid-cols-3">
          {HELP.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-upfleet-border bg-white p-5 shadow-card">
              <Icon size={20} strokeWidth={1.75} className="text-upfleet-dark" />
              <h3 className="mt-3 font-heading text-[0.9375rem] font-semibold tracking-brand text-upfleet-dark">{title}</h3>
              <p className="mt-1.5 text-[0.8125rem] leading-snug text-upfleet-secondary">{body}</p>
            </div>
          ))}
        </section>

        {/* Map + live community reports */}
        <section className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-2xl border border-upfleet-border bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-upfleet-border px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <MapPin size={18} strokeWidth={1.75} className="text-upfleet-dark" />
                  <h2 className="font-heading text-[1.0625rem] font-semibold tracking-brand text-upfleet-dark">Living map of Abu Dhabi</h2>
                </div>
                <div className="hidden flex-wrap gap-x-3 gap-y-1 sm:flex">
                  {legend.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1.5 text-[0.6875rem] text-upfleet-secondary">
                      <span className="h-2 w-2 rounded-full" style={{ background: TYPE_COLORS[t] }} /> {TYPE_LABELS[t]}
                    </span>
                  ))}
                </div>
              </div>
              <div className="h-[440px] w-full lg:h-[560px]">
                <MapView reports={reports} newestId={newestId} />
              </div>
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-upfleet-border bg-white p-5 shadow-card lg:p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-heading text-[1.0625rem] font-semibold tracking-brand text-upfleet-dark">What the community shared</h2>
                <span className="rounded-full bg-upfleet-section-alt px-2.5 py-0.5 text-[0.6875rem] font-semibold text-upfleet-secondary tabular-nums">{reports.length}</span>
              </div>
              <div className="max-h-[520px] overflow-y-auto pr-1">
                <Feed reports={reports} newestId={newestId} />
              </div>
            </div>
          </div>
        </section>

        {/* Community offers (the unique dataset) */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={18} strokeWidth={1.75} className="text-upfleet-dark" />
            <h2 className="font-heading text-[1.0625rem] font-semibold tracking-brand text-upfleet-dark">Latest community offers</h2>
            <span className="text-[0.75rem] text-upfleet-tertiary">Rafiki connects you to the poster on WhatsApp</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {OFFERS.map((o) => (
              <div key={o.id} className="flex flex-col rounded-2xl border border-upfleet-border bg-white p-4 shadow-card">
                <span className="inline-flex w-fit items-center rounded-full bg-upfleet-section-alt px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-upfleet-secondary">{o.category}</span>
                <h3 className="mt-2 font-heading text-[0.875rem] font-semibold tracking-brand text-upfleet-dark">{o.title}</h3>
                <p className="mt-1 line-clamp-2 text-[0.75rem] leading-snug text-upfleet-secondary">{o.detail}</p>
                <p className="mt-2 text-[0.6875rem] text-upfleet-tertiary">{o.poster} · {o.posted}</p>
                <a href={waWith(`Hi Rafiki, I'm interested in "${o.title}" (${o.area}). Can you connect me?`)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[0.75rem] font-medium text-upfleet-blue">
                  Connect via Rafiki →
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Communities */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Users size={18} strokeWidth={1.75} className="text-upfleet-dark" />
            <h2 className="font-heading text-[1.0625rem] font-semibold tracking-brand text-upfleet-dark">Find your people</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COMMUNITIES.map((c) => (
              <button key={c.name} onClick={() => setOpenCommunity(c)} className="group rounded-2xl border border-upfleet-border bg-white p-5 text-left shadow-card transition-all hover:-translate-y-px hover:shadow-card-hover">
                <div className="text-2xl">{c.emoji}</div>
                <h3 className="mt-3 font-heading text-[0.9375rem] font-semibold tracking-brand text-upfleet-dark">{c.name}</h3>
                <p className="mt-1 text-[0.8125rem] text-upfleet-secondary">{c.note}</p>
                <p className="mt-3 text-[0.75rem] font-medium text-upfleet-blue">{c.members} members · see inside →</p>
              </button>
            ))}
          </div>
        </section>

        <footer className="pb-4 pt-2 text-center text-[0.75rem] text-upfleet-tertiary">
          Rafiki · a community companion for Abu Dhabi · message{" "}
          <span className="font-medium text-upfleet-secondary">{WHATSAPP_DISPLAY}</span>
        </footer>
      </main>

      {/* Community modal */}
      {openCommunity && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4" onClick={() => setOpenCommunity(null)}>
          <div className="absolute inset-0 bg-upfleet-dark/50 backdrop-blur-sm" aria-hidden />
          <div className="relative w-full max-w-md rounded-2xl border border-upfleet-border bg-white p-6 shadow-premium" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpenCommunity(null)} className="absolute right-4 top-4 text-upfleet-tertiary hover:text-upfleet-dark" aria-label="Close">
              <X size={18} strokeWidth={2} />
            </button>
            <div className="text-3xl">{openCommunity.emoji}</div>
            <h3 className="mt-3 font-heading text-[1.25rem] font-semibold tracking-brand text-upfleet-dark">{openCommunity.name}</h3>
            <p className="mt-1 text-[0.8125rem] text-upfleet-secondary">{openCommunity.blurb}</p>
            <p className="mt-2 text-[0.75rem] font-medium text-upfleet-blue">{openCommunity.members} members</p>

            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2">
                <CalendarDays size={16} strokeWidth={1.75} className="text-upfleet-dark" />
                <h4 className="font-heading text-[0.875rem] font-semibold tracking-brand text-upfleet-dark">Upcoming</h4>
              </div>
              <ul className="space-y-2">
                {openCommunity.events.map((e) => (
                  <li key={e.title} className="flex items-start gap-3 rounded-xl border border-upfleet-border bg-upfleet-section-alt px-3 py-2.5">
                    <span className="mt-0.5 shrink-0 rounded-md bg-upfleet-dark px-2 py-0.5 text-[0.625rem] font-semibold text-white">{e.when}</span>
                    <span className="text-[0.8125rem] text-upfleet-body">
                      {e.title} <span className="text-upfleet-tertiary">@ {e.where}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <a href={waWith(`Hi Rafiki, what's coming up in the ${openCommunity.name} community? I'd like to take part.`)} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-upfleet-dark px-5 py-2.5 text-[0.8125rem] font-medium text-white tracking-brand transition-colors hover:bg-[#1a1d24]">
              <MessageCircle size={15} strokeWidth={2} /> Ask Rafiki to join
            </a>
            <p className="mt-2 text-center text-[0.6875rem] text-upfleet-tertiary">
              No groups — just tell Rafiki and he connects you directly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
