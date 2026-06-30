"use client";

import { useState, useEffect } from "react";
import { Cpu, Wifi, AlertTriangle, Brain } from "lucide-react";
import { IotDeviceCard } from "@/features/iot/components/IotDeviceCard";
import { AddIotDeviceDialog } from "@/features/iot/components/AddIotDeviceDialog";
import { SmartDosageCalculator } from "@/features/iot/components/SmartDosageCalculator";
import { WaterQualitySection } from "@/features/iot/components/WaterQualitySection";
import { AiInsightPanel } from "@/features/ai-insight/components/AiInsightPanel";
import type { IotDevice } from "@/shared/types/iot.types";
import type { PondCycle, WaterQualityReading } from "@/shared/types/database.types";
import type { PredictionResult } from "@/features/ai-insight/engine/predictionEngine";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import { createClient } from "@/shared/lib/supabase/client";

interface IotDeviceClientPageProps {
  initialDevices: IotDevice[];
  ponds: Array<{ id: string; name: string }>;
  cycles: PondCycle[];
  initialWaterReadings: WaterQualityReading[];
  readingsHistory?: WaterQualityReading[];
  aiPredictions: PredictionResult[];
}

export function IotDeviceClientPage({
  initialDevices,
  ponds,
  cycles,
  initialWaterReadings,
  readingsHistory = [],
  aiPredictions,
}: IotDeviceClientPageProps) {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<IotDevice[]>(initialDevices);

  const cycleMap = new Map<string, string>(cycles.map((c) => [c.pond_id, c.id]));
  const pondMap = new Map<string, string>(ponds.map((p) => [p.id, p.name]));

  // Supabase Realtime Listener — IoT feeder devices
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("public:iot_devices")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "iot_devices" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newDev = payload.new;
            setDevices((prev) => [
              {
                id: newDev.id,
                pond_id: newDev.pond_id,
                pond_name: pondMap.get(newDev.pond_id) || "Kolam",
                device_code: newDev.device_code,
                status: newDev.status || "online",
                battery_level: newDev.battery_level ?? 100,
                hopper_level: newDev.hopper_level ?? 100,
                daily_dispensed_kg: 0,
              },
              ...prev.filter((d) => d.id !== newDev.id),
            ]);
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new;
            setDevices((prev) =>
              prev.map((d) =>
                d.id === updated.id
                  ? {
                      ...d,
                      status: updated.status,
                      battery_level: updated.battery_level,
                      hopper_level: updated.hopper_level,
                    }
                  : d
              )
            );
          } else if (payload.eventType === "DELETE") {
            setDevices((prev) => prev.filter((d) => d.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pondMap]);

  const handleAddDevice = (newDevice: IotDevice) => {
    setDevices((prev) => [newDevice, ...prev]);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Cpu size={24} className="text-sky-500" />
            {t.iot.title}
          </h1>
          <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
            {t.iot.subtitle}
          </p>
        </div>
        <AddIotDeviceDialog ponds={ponds} onAddDevice={handleAddDevice} />
      </div>

      {/* ── Summary Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground dark:text-slate-400">Total Alat Terhubung</p>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              {devices.length} <span className="text-xs font-normal text-gray-400 dark:text-slate-500">unit</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center shrink-0 border border-sky-100 dark:border-sky-800/50">
            <Cpu size={22} className="text-sky-600 dark:text-sky-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground dark:text-slate-400">Sinyal Telemetry Online</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {devices.filter((d) => d.status !== "offline").length} <span className="text-xs font-normal text-gray-400 dark:text-slate-500">unit</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/50">
            <Wifi size={22} className="text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground dark:text-slate-400">Peringatan Tabung Menipis</p>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {devices.filter((d) => d.hopper_level <= 20).length} <span className="text-xs font-normal text-gray-400 dark:text-slate-500">unit</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-800/50">
            <AlertTriangle size={22} className="text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* ── 🌊 Water Quality Realtime ────────────────────────────── */}
      {ponds.length > 0 && (
        <WaterQualitySection
          ponds={ponds}
          initialReadings={initialWaterReadings}
          readingsHistory={readingsHistory}
        />
      )}

      {/* ── 🤖 AI Predictions ────────────────────────────────────── */}
      {aiPredictions.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Brain size={20} className="text-violet-500" />
            AI Prediksi Panen
            <span className="text-xs font-medium text-gray-400 dark:text-slate-500 ml-1">
              — {aiPredictions.length} siklus aktif
            </span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {aiPredictions.map((pred) => (
              <AiInsightPanel key={pred.cycle_id} result={pred} />
            ))}
          </div>
        </section>
      )}

      {/* ── Smart Dosage Calculator ──────────────────────────────── */}
      <SmartDosageCalculator />

      {/* ── IoT Feeder Devices ───────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center justify-between">
          <span>Daftar Perangkat IoT Feeder Aktif</span>
          <span className="text-xs font-normal text-emerald-500 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Supabase Realtime Connected
          </span>
        </h2>
        {devices.length === 0 ? (
          <div className="p-12 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 text-center">
            <p className="text-gray-400 dark:text-slate-500 text-sm">Belum ada perangkat IoT terhubung di database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {devices.map((dev) => (
              <IotDeviceCard
                key={dev.id}
                device={dev}
                cycleId={cycleMap.get(dev.pond_id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
