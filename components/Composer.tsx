"use client";

import { useState } from "react";
import type { Report } from "@/lib/types";

const EXAMPLES = [
  "Scam number +9715XXXXXXX pretending to be the bank, in Al Reem Island",
  "1BR in Khalifa City, paid AED 48,000/yr with 2 months free",
  "Great landlord in Al Raha Beach — returned my deposit in a week",
  "Fast typing centre + medical test clinic in Mussafah, go before 10am",
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
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(text);
          }}
          rows={3}
          placeholder="Message Rafiki a tip — a rent you paid, a scam number, a good landlord…"
          className="flex-1 resize-none rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-400">⌘/Ctrl + Enter to send</span>
        <button
          onClick={() => send(text)}
          disabled={busy || !text.trim()}
          className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition disabled:opacity-30"
        >
          {busy ? "Rafiki is thinking…" : "Send"}
        </button>
      </div>

      {reply && (
        <div className="rounded-xl bg-neutral-100 px-3 py-2 text-sm">
          <span className="mr-1 font-semibold">رفيقي</span> {reply}
        </div>
      )}
      {error && <div className="text-sm text-scam">{error}</div>}

      <div className="flex flex-wrap gap-2 pt-1">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => send(ex)}
            disabled={busy}
            className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600 transition hover:border-black hover:text-black disabled:opacity-40"
          >
            {ex.length > 42 ? ex.slice(0, 42) + "…" : ex}
          </button>
        ))}
      </div>
    </div>
  );
}
