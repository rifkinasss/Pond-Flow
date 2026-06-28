// Script verifikasi koneksi Supabase & tabel tersedia
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import ws from "ws";

// Baca .env.local manual
const env = readFileSync(".env.local", "utf-8");
const get = (key) => env.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim();

const url = get("NEXT_PUBLIC_SUPABASE_URL");
const key = get("NEXT_PUBLIC_SUPABASE_ANON_KEY");

if (!url || !key) {
  console.error("❌ SUPABASE_URL atau ANON_KEY tidak ditemukan di .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  realtime: { transport: ws },
});

const tables = [
  "profiles", "farms", "ponds", "cycles",
  "expenses", "incomes", "inventory_items",
  "inventory_transactions", "harvest_reports", "ai_insights"
];

console.log("🔍 Mengecek koneksi ke Supabase...\n");

let allOk = true;
for (const table of tables) {
  const { error } = await supabase.from(table).select("id").limit(1);
  if (error) {
    console.log(`  ❌ ${table.padEnd(28)} ${error.message}`);
    allOk = false;
  } else {
    console.log(`  ✅ ${table}`);
  }
}

console.log(allOk
  ? "\n🎉 Semua tabel OK — siap development!"
  : "\n⚠️  Ada tabel yang belum dibuat. Jalankan SQL migration dulu."
);
process.exit(allOk ? 0 : 1);
