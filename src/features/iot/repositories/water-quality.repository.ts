import { db } from "@/shared/lib/sqlite/db";
import { ownsPond } from "@/shared/lib/authorization";
import type { WaterQualityReading } from "@/shared/types/database.types";

type ReadingRow = Omit<WaterQualityReading, "raw_payload"> & { raw_payload: string | null };

function normalize(row: ReadingRow): WaterQualityReading {
  return { ...row, raw_payload: row.raw_payload ? JSON.parse(row.raw_payload) : null };
}

export async function findLatestWaterQuality(userId: string, pondId: string) {
  if (!ownsPond(userId, pondId)) return null;
  const { data } = await db().from<ReadingRow>("water_quality_readings").select("*").eq("pond_id", pondId).order("recorded_at", { ascending: false }).limit(1).maybeSingle();
  return data ? normalize(data) : null;
}

export async function findWaterQualityHistory(userId: string, pondId: string, limitRows: number) {
  if (!ownsPond(userId, pondId)) return [];
  const { data } = await db().from<ReadingRow>("water_quality_readings").select("*").eq("pond_id", pondId).order("recorded_at", { ascending: true }).limit(limitRows);
  return (data ?? []).map(normalize);
}

export async function findLatestWaterQualityForPonds(userId: string, pondIds: string[]) {
  const ownedIds = pondIds.filter((id) => ownsPond(userId, id));
  if (!ownedIds.length) return [];
  const { data } = await db().from<ReadingRow>("water_quality_readings").select("*").in("pond_id", ownedIds).order("pond_id").order("recorded_at", { ascending: false });
  const latest = new Map<string, WaterQualityReading>();
  for (const row of data ?? []) if (!latest.has(row.pond_id)) latest.set(row.pond_id, normalize(row));
  return [...latest.values()];
}
