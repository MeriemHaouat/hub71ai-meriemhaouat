import { runBrain } from "./llm";
import { coordsForArea } from "./areas";
import { adminSupabase } from "./supabase";
import type { Report, Turn } from "./types";

export interface HandledMessage {
  kind: "answer" | "listing";
  reply: string;
  report?: Report;
}

const HISTORY_LIMIT = 8; // last 8 messages (~4 turns) of memory

/**
 * Core pipeline shared by the WhatsApp webhook and the web API.
 * With a conversationId (the WhatsApp chat/phone), Rafiki remembers the thread:
 * prior turns are loaded and fed to the brain, and both sides are saved after.
 */
export async function handleMessage(
  text: string,
  source: string,
  conversationId?: string,
): Promise<HandledMessage> {
  const db = adminSupabase();

  // Load recent conversation memory for this chat.
  let history: Turn[] = [];
  if (conversationId && db) {
    const { data } = await db
      .from("conversations")
      .select("role,content")
      .eq("chat_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(HISTORY_LIMIT);
    history = (data ?? []).reverse().map((r: any) => ({ role: r.role, content: r.content }));
  }

  const result = await runBrain(text, history);

  // Save this turn to memory (user message + Rafiki's reply).
  if (conversationId && db) {
    await db.from("conversations").insert([
      { chat_id: conversationId, role: "user", content: text },
      { chat_id: conversationId, role: "assistant", content: result.reply },
    ]);
  }

  if (result.kind !== "listing" || !result.listing) {
    return { kind: "answer", reply: result.reply };
  }

  const ex = result.listing;
  const [lat, lng] =
    typeof ex.lat === "number" && typeof ex.lng === "number"
      ? [ex.lat, ex.lng]
      : coordsForArea(ex.area);

  const row = { type: ex.type, area: ex.area, detail: ex.detail, lat, lng, source };

  if (!db) {
    const report: Report = {
      id: `local-${text.length}-${lat}-${lng}`,
      created_at: new Date().toISOString(),
      ...row,
    };
    return { kind: "listing", reply: result.reply, report };
  }

  const { data, error } = await db.from("reports").insert(row).select().single();
  if (error) throw new Error(`supabase insert failed: ${error.message}`);
  return { kind: "listing", reply: result.reply, report: data as Report };
}
