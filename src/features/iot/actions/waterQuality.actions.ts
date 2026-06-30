"use server";

import { createClient } from "@/shared/lib/supabase/server";
import type { WaterQualityReading } from "@/shared/types/database.types";

/**
 * Ambil pembacaan kualitas air terbaru (1 baris) per kolam
 */
export async function getLatestWaterQuality(
  pondId: string
): Promise<WaterQualityReading | null> {
  const supabase = await createClient();

  const { data, error } = await (supabase as any)
    .from("water_quality_readings")
    .select("*")
    .eq("pond_id", pondId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[WaterQuality] getLatest error:", error.message);
    return null;
  }
  return data ?? null;
}

/**
 * Ambil riwayat pembacaan per kolam (N jam terakhir, per jam)
 * Digunakan untuk chart time-series
 */
export async function getWaterQualityHistory(
  pondId: string,
  limitRows = 48
): Promise<WaterQualityReading[]> {
  const supabase = await createClient();

  const { data, error } = await (supabase as any)
    .from("water_quality_readings")
    .select("*")
    .eq("pond_id", pondId)
    .order("recorded_at", { ascending: true })
    .limit(limitRows);

  if (error) {
    console.error("[WaterQuality] getHistory error:", error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Ambil pembacaan terbaru untuk semua kolam user (untuk ringkasan di IoT page)
 */
export async function getLatestWaterQualityAllPonds(
  pondIds: string[]
): Promise<WaterQualityReading[]> {
  if (pondIds.length === 0) return [];
  const supabase = await createClient();

  // Ambil 1 baris terbaru per pond_id menggunakan DISTINCT ON
  const { data, error } = await (supabase as any)
    .from("water_quality_readings")
    .select("*")
    .in("pond_id", pondIds)
    .order("pond_id")
    .order("recorded_at", { ascending: false });

  if (error) {
    console.error("[WaterQuality] getAllPonds error:", error.message);
    return [];
  }

  // Deduplicate — ambil 1 terbaru per kolam
  const seen = new Set<string>();
  const result: WaterQualityReading[] = [];
  for (const row of (data ?? [])) {
    if (!seen.has(row.pond_id)) {
      seen.add(row.pond_id);
      result.push(row);
    }
  }
  return result;
}
