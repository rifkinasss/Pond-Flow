import type { Metadata } from "next";
import { createClient } from "@/shared/lib/supabase/server";
import { IotDeviceClientPage } from "./IotDeviceClientPage";
import type { Pond, PondCycle, WaterQualityReading } from "@/shared/types/database.types";
import { getLatestWaterQualityAllPonds } from "@/features/iot/actions/waterQuality.actions";
import { runPredictionEngine } from "@/features/ai-insight/engine/predictionEngine";
import type { PredictionCycleInput, FeedingLogInput, PredictionResult } from "@/features/ai-insight/engine/predictionEngine";

export const metadata: Metadata = { title: "IoT Auto-Feeder & Dispenser Cerdas" };

export default async function IotDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch Farms
  const { data: farmsData } = await supabase
    .from("farms")
    .select("id, name")
    .eq("user_id", user.id);
  const farmIds = (farmsData ?? []).map((f) => f.id);

  // Fetch Ponds
  let ponds: Pond[] = [];
  if (farmIds.length > 0) {
    const { data: pondsData } = await supabase
      .from("ponds")
      .select("*")
      .in("farm_id", farmIds);
    ponds = pondsData ?? [];
  }

  const pondIds = ponds.map((p) => p.id);
  const pondMap = new Map<string, string>(ponds.map((p) => [p.id, p.name]));

  // Fetch Active Cycles
  let activeCycles: PondCycle[] = [];
  if (pondIds.length > 0) {
    const { data: cyclesData } = await supabase
      .from("pond_cycles")
      .select("*")
      .in("pond_id", pondIds)
      .eq("status", "active");
    activeCycles = cyclesData ?? [];
  }

  // Fetch Initial IoT Devices
  const { data: devicesData } = await supabase
    .from("iot_devices")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const initialDevices = (devicesData ?? []).map((d: any) => ({
    id: d.id,
    pond_id: d.pond_id,
    pond_name: pondMap.get(d.pond_id) || "Kolam",
    device_code: d.device_code,
    status: d.status || "online",
    battery_level: d.battery_level ?? 100,
    hopper_level: d.hopper_level ?? 100,
    daily_dispensed_kg: 0,
  }));

  // ── Water Quality: ambil pembacaan terbaru semua kolam ─────────────────
  const latestWaterReadings = await getLatestWaterQualityAllPonds(pondIds);

  // ── Water Quality History (7 hari terakhir untuk grafik & AI) ──────────
  let allWaterReadings: WaterQualityReading[] = [];
  if (pondIds.length > 0) {
    const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const { data: wqData } = await (supabase as any)
      .from("water_quality_readings")
      .select("*")
      .in("pond_id", pondIds)
      .gte("recorded_at", since)
      .order("recorded_at", { ascending: true });
    allWaterReadings = wqData ?? [];
  }

  // ── AI Predictions: jalankan untuk setiap siklus aktif ─────────────────
  let aiPredictions: PredictionResult[] = [];
  if (activeCycles.length > 0) {
    // Fetch feeding logs untuk semua siklus aktif
    const cycleIds = activeCycles.map((c) => c.id);
    let feedingLogs: FeedingLogInput[] = [];
    if (cycleIds.length > 0) {
      const { data: logsData } = await (supabase as any)
        .from("feeding_logs")
        .select("cycle_id, amount_kg, feed_time")
        .in("cycle_id", cycleIds)
        .order("feed_time", { ascending: true });

      feedingLogs = (logsData ?? []).map((l: any) => ({
        cycle_id: l.cycle_id,
        amount_kg: Number(l.amount_kg ?? 0),
        feed_time: l.feed_time,
      }));
    }

    // Jalankan prediction engine
    aiPredictions = activeCycles.map((cycle) => {
      const cycleInput: PredictionCycleInput = {
        id: cycle.id,
        pond_id: cycle.pond_id,
        pond_name: pondMap.get(cycle.pond_id) ?? "Kolam",
        fish_type: cycle.fish_type,
        initial_stock: cycle.initial_stock,
        current_stock: cycle.current_stock,
        start_date: cycle.start_date,
        target_days: cycle.target_days,
        status: cycle.status,
      };
      return runPredictionEngine(cycleInput, feedingLogs, allWaterReadings);
    });
  }

  return (
    <IotDeviceClientPage
      initialDevices={initialDevices}
      ponds={ponds.map((p) => ({ id: p.id, name: p.name }))}
      cycles={activeCycles}
      initialWaterReadings={latestWaterReadings}
      readingsHistory={allWaterReadings}
      aiPredictions={aiPredictions}
    />
  );
}
