/**
 * PondFlow AI Prediction Engine
 * ─────────────────────────────────────────────────────────────────
 * Model prediksi berbasis Bio-economic Aquaculture Model.
 * Tidak memerlukan API eksternal — berjalan 100% di server Next.js.
 *
 * Algoritma:
 *  - Optimal Harvest Date  : start_date + target_days, dikoreksi FCR & suhu
 *  - Survival Rate (SR%)   : tren mortalitas dari feeding pattern
 *  - FCR Score             : total_pakan_kg / estimasi_biomassa_kg
 *  - Growth Rate           : estimasi berdasarkan suhu rata-rata vs optimal
 *  - Confidence            : berdasarkan jumlah data yang tersedia
 */

import type { WaterQualityReading } from "@/shared/types/database.types";

// ─── Input types ────────────────────────────────────────────────────────────

export interface PredictionCycleInput {
  id: string;
  pond_id: string;
  pond_name: string;
  fish_type: string;
  initial_stock: number;
  current_stock: number;
  start_date: string;        // ISO date string
  target_days: number | null;
  status: "active" | "harvested";
}

export interface FeedingLogInput {
  cycle_id: string;
  amount_kg: number;
  feed_time: string;         // ISO datetime
}

// ─── Output types ────────────────────────────────────────────────────────────

export type ConfidenceLevel = "high" | "medium" | "low";
export type GradeLevel = "A" | "B" | "C" | "D";
export type AlertSeverity = "info" | "warning" | "critical";

export interface PredictionAlert {
  severity: AlertSeverity;
  message: string;
  param?: string;
}

export interface PredictionResult {
  cycle_id: string;
  pond_id: string;
  pond_name: string;
  fish_type: string;

  // ── Core predictions ──
  /** Perkiraan tanggal panen optimal (ISO date string) */
  optimal_harvest_date: string;
  /** Jumlah hari dari sekarang ke panen */
  days_to_harvest: number;
  /** Estimasi survival rate (0–100%) */
  survival_rate_pct: number;
  /** Feed Conversion Ratio aktual */
  fcr_actual: number;
  /** Target FCR berdasarkan jenis ikan */
  fcr_target: number;
  /** Efisiensi pakan: (fcr_target / fcr_actual) × 100 */
  feed_efficiency_pct: number;
  /** Estimasi berat total panen (kg) */
  estimated_harvest_kg: number;
  /** Estimasi nilai panen (Rp) */
  estimated_revenue: number;
  /** Pertumbuhan rata-rata per hari (%) */
  daily_growth_rate_pct: number;

  // ── Water quality impact ──
  /** Rata-rata suhu 7 hari terakhir */
  avg_temperature_7d: number | null;
  /** Faktor koreksi pertumbuhan akibat suhu (0.5 – 1.2) */
  temperature_growth_factor: number;
  /** Status pH — pengaruh ke kesehatan ikan */
  ph_status: "optimal" | "suboptimal" | "critical" | "unknown";

  // ── Meta ──
  confidence: ConfidenceLevel;
  grade: GradeLevel;
  alerts: PredictionAlert[];
  /** Berapa hari budidaya sudah berjalan */
  days_elapsed: number;
  /** Total pakan yang sudah diberikan (kg) */
  total_feed_kg: number;
  generated_at: string;
}

// ─── Constants: target FCR per jenis ikan ───────────────────────────────────

const FCR_TARGETS: Record<string, number> = {
  lele:    1.0,
  nila:    1.4,
  mas:     1.5,
  gurame:  2.0,
  patin:   1.3,
  udang:   1.5,
  bandeng: 1.8,
  bawal:   1.4,
};

const DEFAULT_FCR_TARGET = 1.6;

/** Harga estimasi per kg per jenis ikan (Rp) */
const PRICE_PER_KG: Record<string, number> = {
  lele:    18_000,
  nila:    22_000,
  mas:     28_000,
  gurame:  35_000,
  patin:   20_000,
  udang:   55_000,
  bandeng: 22_000,
  bawal:   26_000,
};
const DEFAULT_PRICE_PER_KG = 23_000;

/** Berat rata-rata per ekor saat panen (kg) per jenis ikan */
const HARVEST_WEIGHT_PER_FISH: Record<string, number> = {
  lele:    0.15,
  nila:    0.30,
  mas:     0.50,
  gurame:  0.40,
  patin:   0.60,
  udang:   0.02,
  bandeng: 0.35,
  bawal:   0.45,
};
const DEFAULT_HARVEST_WEIGHT = 0.30;

/** Suhu optimal untuk pertumbuhan ikan (°C) */
const OPTIMAL_TEMP = 28.5;
const TEMP_RANGE   = 4.0; // ±4°C dari optimal masih cukup baik

// ─── Main engine ─────────────────────────────────────────────────────────────

export function runPredictionEngine(
  cycle: PredictionCycleInput,
  feedingLogs: FeedingLogInput[],
  waterReadings: WaterQualityReading[]
): PredictionResult {
  const now = new Date();
  const startDate = new Date(cycle.start_date);
  const daysElapsed = Math.max(
    1,
    Math.floor((now.getTime() - startDate.getTime()) / 86_400_000)
  );

  const fishTypeKey = cycle.fish_type.toLowerCase().replace(/[^a-z]/g, "");
  const fcrTarget =
    FCR_TARGETS[fishTypeKey] ??
    Object.entries(FCR_TARGETS).find(([k]) => fishTypeKey.includes(k))?.[1] ??
    DEFAULT_FCR_TARGET;

  const pricePerKg =
    PRICE_PER_KG[fishTypeKey] ??
    Object.entries(PRICE_PER_KG).find(([k]) => fishTypeKey.includes(k))?.[1] ??
    DEFAULT_PRICE_PER_KG;

  const harvestWeightPerFish =
    HARVEST_WEIGHT_PER_FISH[fishTypeKey] ??
    Object.entries(HARVEST_WEIGHT_PER_FISH).find(([k]) => fishTypeKey.includes(k))?.[1] ??
    DEFAULT_HARVEST_WEIGHT;

  // ── 1. Total pakan ──────────────────────────────────────────────────────
  const cycleLogs = feedingLogs.filter((l) => l.cycle_id === cycle.id);
  const totalFeedKg = cycleLogs.reduce((s, l) => s + l.amount_kg, 0);

  // ── 2. Survival Rate ────────────────────────────────────────────────────
  const survivalRatePct = cycle.initial_stock > 0
    ? Math.min(100, (cycle.current_stock / cycle.initial_stock) * 100)
    : 100;

  // ── 3. Biomass & FCR ────────────────────────────────────────────────────
  // Estimasi biomassa = jumlah ikan × berat per ekor
  const estimatedBiomassKg = cycle.current_stock * harvestWeightPerFish;
  const fcrActual = estimatedBiomassKg > 0
    ? Math.round((totalFeedKg / estimatedBiomassKg) * 100) / 100
    : 0;
  const feedEfficiencyPct = fcrActual > 0
    ? Math.min(150, Math.round((fcrTarget / fcrActual) * 100))
    : 0;

  // ── 4. Water quality factors ─────────────────────────────────────────────
  // Suhu rata-rata 7 hari terakhir
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString();
  const recentReadings = waterReadings.filter(
    (r) => r.pond_id === cycle.pond_id && r.recorded_at >= sevenDaysAgo && r.temperature !== null
  );

  let avgTemp7d: number | null = null;
  let tempGrowthFactor = 1.0;

  if (recentReadings.length > 0) {
    avgTemp7d =
      recentReadings.reduce((s, r) => s + (r.temperature ?? 0), 0) /
      recentReadings.length;
    avgTemp7d = Math.round(avgTemp7d * 10) / 10;

    // Faktor koreksi: optimal = 1.0, makin jauh dari optimal makin kecil
    const tempDiff = Math.abs(avgTemp7d - OPTIMAL_TEMP);
    if (tempDiff <= 1) {
      tempGrowthFactor = 1.0 + (1 - tempDiff) * 0.05; // sedikit bonus
    } else if (tempDiff <= TEMP_RANGE) {
      tempGrowthFactor = 1.0 - (tempDiff / TEMP_RANGE) * 0.2;
    } else {
      tempGrowthFactor = Math.max(0.5, 1.0 - (tempDiff / TEMP_RANGE) * 0.35);
    }
    tempGrowthFactor = Math.round(tempGrowthFactor * 100) / 100;
  }

  // Status pH terbaru
  const latestReading = waterReadings
    .filter((r) => r.pond_id === cycle.pond_id && r.ph_level !== null)
    .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))[0];

  let phStatus: PredictionResult["ph_status"] = "unknown";
  if (latestReading?.ph_level !== null && latestReading?.ph_level !== undefined) {
    const ph = latestReading.ph_level;
    if (ph >= 6.8 && ph <= 8.2) phStatus = "optimal";
    else if (ph >= 6.5 && ph <= 8.5) phStatus = "suboptimal";
    else phStatus = "critical";
  }

  // ── 5. Optimal Harvest Date ──────────────────────────────────────────────
  const targetDays = cycle.target_days ?? 90;
  // Koreksi: target_days / faktor suhu (suhu rendah = butuh lebih lama)
  const correctedDays = Math.round(targetDays / tempGrowthFactor);
  const harvestDate = new Date(startDate.getTime() + correctedDays * 86_400_000);
  const daysToHarvest = Math.max(
    0,
    Math.round((harvestDate.getTime() - now.getTime()) / 86_400_000)
  );

  // ── 6. Estimated harvest & revenue ─────────────────────────────────────
  const estimatedHarvestKg = Math.round(
    cycle.current_stock * harvestWeightPerFish * (survivalRatePct / 100) * 10
  ) / 10;
  const estimatedRevenue = Math.round(estimatedHarvestKg * pricePerKg);

  // ── 7. Daily growth rate ─────────────────────────────────────────────────
  const dailyGrowthRatePct =
    daysElapsed > 0
      ? Math.round((estimatedBiomassKg / (cycle.initial_stock * 0.001) / daysElapsed) * 100) / 100
      : 0;

  // ── 8. Confidence ────────────────────────────────────────────────────────
  let confidence: ConfidenceLevel;
  if (cycleLogs.length >= 14 && recentReadings.length >= 5) {
    confidence = "high";
  } else if (cycleLogs.length >= 3 || recentReadings.length >= 1) {
    confidence = "medium";
  } else {
    confidence = "low";
  }

  // ── 9. Grade ─────────────────────────────────────────────────────────────
  let gradeScore = 0;
  if (survivalRatePct >= 90) gradeScore += 3;
  else if (survivalRatePct >= 75) gradeScore += 2;
  else if (survivalRatePct >= 60) gradeScore += 1;

  if (fcrActual > 0 && fcrActual <= fcrTarget) gradeScore += 3;
  else if (fcrActual > 0 && fcrActual <= fcrTarget * 1.2) gradeScore += 2;
  else if (fcrActual > 0) gradeScore += 1;

  if (phStatus === "optimal") gradeScore += 2;
  else if (phStatus === "suboptimal") gradeScore += 1;

  const grade: GradeLevel =
    gradeScore >= 7 ? "A" : gradeScore >= 5 ? "B" : gradeScore >= 3 ? "C" : "D";

  // ── 10. Alerts ───────────────────────────────────────────────────────────
  const alerts: PredictionAlert[] = [];

  if (survivalRatePct < 70) {
    alerts.push({
      severity: "critical",
      param: "survival_rate",
      message: `SR ${survivalRatePct.toFixed(1)}% sangat rendah — periksa kondisi kolam segera!`,
    });
  } else if (survivalRatePct < 85) {
    alerts.push({
      severity: "warning",
      param: "survival_rate",
      message: `SR ${survivalRatePct.toFixed(1)}% di bawah rata-rata — pantau kesehatan ikan.`,
    });
  }

  if (fcrActual > 0 && fcrActual > fcrTarget * 1.3) {
    alerts.push({
      severity: "warning",
      param: "fcr",
      message: `FCR ${fcrActual.toFixed(2)} jauh di atas target (${fcrTarget}) — pakan terbuang berlebih.`,
    });
  }

  if (phStatus === "critical") {
    alerts.push({
      severity: "critical",
      param: "ph",
      message: "pH air di luar batas aman — ikan berisiko stress & kematian massal.",
    });
  }

  if (avgTemp7d !== null && Math.abs(avgTemp7d - OPTIMAL_TEMP) > TEMP_RANGE) {
    alerts.push({
      severity: "warning",
      param: "temperature",
      message: `Suhu rata-rata ${avgTemp7d}°C jauh dari optimal (${OPTIMAL_TEMP}°C) — pertumbuhan melambat.`,
    });
  }

  if (daysToHarvest <= 7 && daysToHarvest > 0) {
    alerts.push({
      severity: "info",
      param: "harvest",
      message: `Estimasi panen ${daysToHarvest} hari lagi — persiapkan buyer dan logistik.`,
    });
  } else if (daysToHarvest === 0) {
    alerts.push({
      severity: "info",
      param: "harvest",
      message: "Kolam sudah memasuki periode panen optimal!",
    });
  }

  if (cycleLogs.length === 0) {
    alerts.push({
      severity: "info",
      message: "Belum ada log pakan — akurasi prediksi rendah. Catat pakan harian untuk hasil lebih baik.",
    });
  }

  return {
    cycle_id: cycle.id,
    pond_id: cycle.pond_id,
    pond_name: cycle.pond_name,
    fish_type: cycle.fish_type,
    optimal_harvest_date: harvestDate.toISOString().split("T")[0],
    days_to_harvest: daysToHarvest,
    survival_rate_pct: Math.round(survivalRatePct * 10) / 10,
    fcr_actual: fcrActual,
    fcr_target: fcrTarget,
    feed_efficiency_pct: feedEfficiencyPct,
    estimated_harvest_kg: estimatedHarvestKg,
    estimated_revenue: estimatedRevenue,
    daily_growth_rate_pct: dailyGrowthRatePct,
    avg_temperature_7d: avgTemp7d,
    temperature_growth_factor: tempGrowthFactor,
    ph_status: phStatus,
    confidence,
    grade,
    alerts,
    days_elapsed: daysElapsed,
    total_feed_kg: Math.round(totalFeedKg * 100) / 100,
    generated_at: now.toISOString(),
  };
}
