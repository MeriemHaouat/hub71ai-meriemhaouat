"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import type { Report } from "@/lib/types";

const EXAMPLES = [
  "Scam number pretending to be the bank, in Al Reem Island",
  "1BR in Khalifa City, paid AED 48,000/yr",
  "Great landlord in Al Raha Beach — returned my deposit",
  "Fast medical-test clinic in Mussafah, go before 10am",
];

export default function Composer({
  onNewReport,
}: {
  onNewReport: (r: Report) => void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(message: string) {
    const msg = message.trim();
    if (!msg || busy) return;
    setBusy(true);
    setError(null);
    setReply(null);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong");
      onNewReport(data.report as Report);
      setReply(data.reply as string);
      setText("");
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(text);
        }}
        rows={3}
        placeholder="Tell Rafiki a tip — a rent you paid, a scam number, a good landlord, a clinic…"
        className="w-full resize-none rounded-xl border border-upfleet-border bg-white px-4 py-3 font-body text-[0.9375rem] text-upfleet-dark tracking-brand outline-none transition-colors placeholder:text-upfleet-tertiary focus:border-upfleet-dark"
      />

      <div className="flex items-center justify-between">
        <span className="text-[0.6875rem] uppercase tracking-[0.15em] text-upfleet-tertiary">
          ⌘/Ctrl + Enter
        </span>
        <button
          onClick={() => send(text)}
          disabled={busy || !text.trim()}
          className="inline-flex items-center gap-2 rounded-[10px] bg-upfleet-dark px-5 py-2.5 font-body text-[0.8125rem] font-medium text-white tracking-brand transition-all duration-200 hover:-translate-y-px hover:bg-[#1a1d24] hover:shadow-premium disabled:translate-y-0 disabled:opacity-40 disabled:shadow-none"
        >
          {busy ? (
            "Rafiki is thinking…"
          ) : (
            <>
              <Send size={15} strokeWidth={1.75} /> Send to Rafiki
            </>
          )}
        </button>
      </div>

      {reply && (
        <div className="flex items-start gap-2.5 rounded-xl border border-upfleet-border bg-upfleet-section-alt px-4 py-3">
          <Sparkles size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-upfleet-yellow" />
          <p className="text-[0.875rem] leading-relaxed text-upfleet-body">
            <span className="font-heading font-semibold text-upfleet-dark">رفيقي</span>{" "}
            {reply}
          </p>
        </div>
      )}
      {error && <p className="text-[0.8125rem] text-upfleet-negative">{error}</p>}

      <div className="flex flex-wrap gap-2 pt-1">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => send(ex)}
            disabled={busy}
            className="rounded-full border border-upfleet-border bg-white px-3 py-1.5 text-[0.75rem] text-upfleet-secondary tracking-brand transition-colors hover:border-upfleet-dark hover:text-upfleet-dark disabled:opacity-40"
          >
            {ex.length > 38 ? ex.slice(0, 38) + "…" : ex}
          </button>
        ))}
      </div>
    </div>
  );
}
