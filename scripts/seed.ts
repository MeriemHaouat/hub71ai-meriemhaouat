// Seed the Supabase `reports` table with sample Abu Dhabi tips.
// Run:  npm run seed    (loads .env.local automatically)

import { createClient } from "@supabase/supabase-js";
import seed from "../data/reports.seed.json";
import { coordsForArea } from "../lib/areas";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "Fill in .env.local first.",
  );
  process.exit(1);
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } });

const rows = (seed as any[]).map((r) => {
  const [lat, lng] =
    typeof r.lat === "number" && typeof r.lng === "number"
      ? [r.lat, r.lng]
      : coordsForArea(r.area);
  return {
    type: r.type,
    area: r.area,
    detail: r.detail,
    lat,
    lng,
    source: "seed",
  };
});

async function main() {
  const { error, count } = await db
    .from("reports")
    .insert(rows, { count: "exact" });

  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }

  console.log(`Seeded ${count ?? rows.length} reports.`);
}

main();
