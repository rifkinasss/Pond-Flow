"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import { WaterQualityCard } from "./WaterQualityCard";
import { WaterQualityTrendChart } from "./WaterQualityTrendChart";
import type { WaterQualityReading } from "@/shared/types/database.types";
import { Waves, RefreshCw } from "lucide-react";

interface WaterQualitySectionProps {
  /** Kolam yang punya siklus aktif atau terhubung ke sensor */
  ponds: Array<{ id: string; name: string }>;
  /** Data terbaru dari server (SSR) */
  initialReadings: WaterQualityReading[];
  /** Riwayat data untuk grafik */
  readingsHistory?: WaterQualityReading[];
}

export function WaterQualitySection({
  ponds,
  initialReadings,
  readingsHistory = [],
}: WaterQualitySectionProps) {
  const [readings, setReadings] = useState<Map<string, WaterQualityReading>>(
    () => {
      const map = new Map<string, WaterQualityReading>();
      for (const r of initialReadings) map.set(r.pond_id, r);
      return map;
    }
  );
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLastUpdate(new Date());
  }, []);

  // Supabase Realtime — update live saat sensor kirim data baru
  useEffect(() => {
    const supabase = createClient();
    const pondIds = ponds.map((p) => p.id);
    if (pondIds.length === 0) return;

    const channel = supabase
      .channel("water_quality_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "water_quality_readings",
        },
        (payload) => {
          const newRow = payload.new as WaterQualityReading;
          if (!pondIds.includes(newRow.pond_id)) return;

          setReadings((prev) => {
            const updated = new Map(prev);
            const existing = updated.get(newRow.pond_id);
            // Hanya update jika lebih baru
            if (!existing || new Date(newRow.recorded_at) > new Date(existing.recorded_at)) {
              updated.set(newRow.pond_id, newRow);
              setLastUpdate(new Date());
            }
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ponds]);

  if (ponds.length === 0) return null;

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Waves size={20} className="text-sky-500" />
          Kualitas Air Realtime
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-emerald-500 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Live
          </span>
          <span className="text-[11px] text-gray-400 dark:text-slate-500 flex items-center gap-1">
            <RefreshCw size={10} />
            {mounted && lastUpdate
              ? lastUpdate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
              : "--:--:--"}
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ponds.map((pond) => (
          <WaterQualityCard
            key={pond.id}
            pondName={pond.name}
            reading={readings.get(pond.id) ?? null}
          />
        ))}
      </div>

      {/* 📊 Water Quality Trend Chart */}
      <WaterQualityTrendChart
        ponds={ponds}
        readingsHistory={readingsHistory}
      />

      {/* No sensor connected notice */}
      {readings.size === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-sky-200 dark:border-sky-800/40 p-6 text-center space-y-2">
          <Waves size={28} className="mx-auto text-sky-300 dark:text-sky-700" />
          <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">
            Sensor kualitas air belum terhubung
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500 max-w-sm mx-auto">
            Hardware sensor akan mengirim data secara otomatis ke{" "}
            <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sky-600 dark:text-sky-400 font-mono text-[10px]">
              POST /api/iot/telemetry
            </code>
          </p>
        </div>
      )}
    </section>
  );
}
