"use server";

import { getCurrentUser } from "@/shared/lib/auth";
import type { WaterQualityReading } from "@/shared/types/database.types";
import { findLatestWaterQuality, findLatestWaterQualityForPonds, findWaterQualityHistory } from "@/features/iot/repositories/water-quality.repository";

/**
 * Ambil pembacaan kualitas air terbaru (1 baris) per kolam
 */
export async function getLatestWaterQuality(
  pondId: string
): Promise<WaterQualityReading | null> {
  const user = await getCurrentUser();
  return user ? findLatestWaterQuality(user.id, pondId) : null;
}

/**
 * Ambil riwayat pembacaan per kolam (N jam terakhir, per jam)
 * Digunakan untuk chart time-series
 */
export async function getWaterQualityHistory(
  pondId: string,
  limitRows = 48
): Promise<WaterQualityReading[]> {
  const user = await getCurrentUser();
  return user ? findWaterQualityHistory(user.id, pondId, limitRows) : [];
}

/**
 * Ambil pembacaan terbaru untuk semua kolam user (untuk ringkasan di IoT page)
 */
export async function getLatestWaterQualityAllPonds(
  pondIds: string[]
): Promise<WaterQualityReading[]> {
  if (pondIds.length === 0) return [];
  const user = await getCurrentUser();
  return user ? findLatestWaterQualityForPonds(user.id, pondIds) : [];
}
