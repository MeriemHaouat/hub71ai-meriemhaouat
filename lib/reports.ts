import { extractReport } from "./anthropic";
import { coordsForArea } from "./areas";
import { adminSupabase } from "./supabase";
import type { Extracted, Report } from "./types";

/**
 * Core pipeline shared by the WhatsApp webhook and the web composer:
 * message text -> Claude extraction -> coordinates -> insert into Supabase.
 * Returns the saved report plus the reply Rafiki should send back.
 */
export async function ingestMessage(
  text: string,
  source: string,
): Promise<{ report: Report; reply: string }> {
  const extracted: Extracted = await extractReport(text);

  const [lat, lng] =
    typeof extracted.lat === "number" && typeof extracted.lng === "number"
      ? [extracted.lat, extracted.lng]
      : coordsForArea(extracted.area);

  const row = {
    type: extracted.type,
    area: extracted.area,
    detail: extracted.detail,
    lat,
    lng,
    source,
  };

  const db = adminSupabase();
  if (!db) {
    // No DB configured yet (early dev) — return an ephemeral report so the
    // flow still works end-to-end locally.
    const report: Report = {
      id: `local-${text.length}-${lat}-${lng}`,
      created_at: new Date().toISOString(),
      ...row,
    };
    return { report, reply: extracted.reply };
  }

  const { data, error } = await db
    .from("reports")
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(`supabase insert failed: ${error.message}`);
  return { report: data as Report, reply: extracted.reply };
}
