import { runBrain } from "./llm";
import { coordsForArea } from "./areas";
import { adminSupabase } from "./supabase";
import type { Report } from "./types";

export interface HandledMessage {
  kind: "answer" | "listing";
  reply: string;
  report?: Report;
}

/**
 * Core pipeline shared by the WhatsApp webhook and the web API:
 * message -> Rafiki brain decides intent.
 *  - answer:  reply only, nothing saved.
 *  - listing: resolve coordinates, save to Supabase, reply.
 */
export async function handleMessage(
  text: string,
  source: string,
): Promise<HandledMessage> {
  const result = await runBrain(text);

  if (result.kind !== "listing" || !result.listing) {
    return { kind: "answer", reply: result.reply };
  }

  const ex = result.listing;
  const [lat, lng] =
    typeof ex.lat === "number" && typeof ex.lng === "number"
      ? [ex.lat, ex.lng]
      : coordsForArea(ex.area);

  const row = {
    type: ex.type,
    area: ex.area,
    detail: ex.detail,
    lat,
    lng,
    source,
  };

  const db = adminSupabase();
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
