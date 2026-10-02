import { NextRequest, NextResponse } from "next/server";
import { handleMessage } from "@/lib/reports";
import { adminSupabase } from "@/lib/supabase";
import seed from "@/data/reports.seed.json";
import { coordsForArea } from "@/lib/areas";
import type { Report } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/reports — all reports for the map (falls back to seed data if no DB).
export async function GET() {
  const db = adminSupabase();
  if (!db) {
    const reports: Report[] = (seed as any[]).map((r, i) => {
      const [lat, lng] =
        typeof r.lat === "number" && typeof r.lng === "number"
          ? [r.lat, r.lng]
          : coordsForArea(r.area);
      return {
        id: `seed-${i}`,
        type: r.type,
        area: r.area,
        detail: r.detail,
        lat,
        lng,
        source: "seed",
        created_at: new Date(Date.now() - i * 3600_000).toISOString(),
      };
    });
    return NextResponse.json({ reports, source: "seed" });
  }

  const { data, error } = await db
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ reports: data ?? [], source: "db" });
}

// POST /api/reports — web composer: simulate a WhatsApp message end-to-end.
export async function POST(req: NextRequest) {
  let text: string | undefined;
  try {
    ({ text } = await req.json());
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!text || !text.trim()) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  try {
    const { kind, reply, report } = await handleMessage(text.trim(), "web");
    return NextResponse.json({ kind, reply, report });
  } catch (err: any) {
    console.error("[api/reports] handle failed:", err);
    return NextResponse.json(
      { error: err?.message || "ingest failed" },
      { status: 500 },
    );
  }
}
