"use client";

import {
  WATER_QUALITY_THRESHOLDS,
  getParamStatus,
  type WaterQualityReading,
  type WaterQualityParam,
} from "@/shared/types/database.types";
import { Thermometer, Droplets, Wind, Waves, FlaskConical, ArrowDown, Wifi, WifiOff } from "lucide-react";

interface WaterQualityCardProps {
  pondName: string;
  reading: WaterQualityReading | null;
}

const PARAM_CONFIG: {
  key: WaterQualityParam;
  label: string;
  icon: React.ElementType;
  format: (v: number) => string;
  color: string;
}[] = [
  {
    key: "temperature",
    label: "Suhu",
    icon: Thermometer,
    format: (v) => `${v.toFixed(1)} °C`,
    color: "text-orange-500",
  },
  {
    key: "ph_level",
    label: "pH",
    icon: FlaskConical,
    format: (v) => v.toFixed(2),
    color: "text-purple-500",
  },
  {
    key: "dissolved_oxygen",
    label: "DO",
    icon: Wind,
    format: (v) => `${v.toFixed(1)} ppm`,
    color: "text-sky-500",
  },
  {
    key: "salinity",
    label: "Salinitas",
    icon: Droplets,
    format: (v) => `${v.toFixed(1)} ppt`,
    color: "text-blue-500",
  },
  {
    key: "ammonia",
    label: "Amonia",
    icon: FlaskConical,
    format: (v) => `${v.toFixed(4)} ppm`,
    color: "text-yellow-600",
  },
  {
    key: "water_depth",
    label: "Kedalaman",
    icon: ArrowDown,
    format: (v) => `${v.toFixed(2)} m`,
    color: "text-cyan-500",
  },
];

const STATUS_STYLES = {
  normal:  "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50",
  warning: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50",
  critical:"bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/50",
  no_data: "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-slate-700",
};

const STATUS_BADGE: Record<string, string> = {
  normal:  "✅ Normal",
  warning: "⚠️ Waspada",
  critical:"🔴 Kritis",
  no_data: "— Belum ada data",
};

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    normal:  "bg-emerald-500",
    warning: "bg-amber-500 animate-pulse",
    critical:"bg-red-500 animate-pulse",
    no_data: "bg-gray-400",
  };
  return (
    <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${colors[status] ?? colors.no_data}`} />
  );
}

export function WaterQualityCard({ pondName, reading }: WaterQualityCardProps) {
  const hasData = reading !== null;

  // Overall status: worst of all params
  const statuses = PARAM_CONFIG.map((p) =>
    getParamStatus(p.key, reading ? (reading[p.key] as number | null) : null)
  );
  const overallStatus = statuses.includes("critical")
    ? "critical"
    : statuses.includes("warning")
      ? "warning"
      : statuses.every((s) => s === "no_data")
        ? "no_data"
        : "normal";

  const recordedAt = reading?.recorded_at
    ? new Date(reading.recorded_at).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-800/50 flex items-center justify-center">
            <Waves size={18} className="text-sky-500" />
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900 dark:text-white">{pondName}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500" suppressHydrationWarning>
              {recordedAt ? `Update: ${recordedAt}` : "Menunggu sinyal sensor..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasData ? (
            <Wifi size={14} className="text-emerald-500" />
          ) : (
            <WifiOff size={14} className="text-gray-400" />
          )}
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${STATUS_STYLES[overallStatus]}`}
          >
            <StatusDot status={overallStatus} />
            {STATUS_BADGE[overallStatus]}
          </span>
        </div>
      </div>

      {/* Parameter Grid */}
      <div className="grid grid-cols-3 gap-px bg-gray-100 dark:bg-slate-800">
        {PARAM_CONFIG.map((param) => {
          const raw = reading ? (reading[param.key] as number | null) : null;
          const status = getParamStatus(param.key, raw);
          const Icon = param.icon;
          const threshold = WATER_QUALITY_THRESHOLDS[param.key];

          return (
            <div
              key={param.key}
              className="bg-white dark:bg-slate-900 p-3 flex flex-col gap-1.5"
            >
              <div className="flex items-center gap-1.5">
                <Icon size={12} className={param.color} />
                <span className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                  {param.label}
                </span>
              </div>

              <p className={`text-sm font-extrabold leading-tight ${
                status === "critical"
                  ? "text-red-600 dark:text-red-400"
                  : status === "warning"
                    ? "text-amber-600 dark:text-amber-400"
                    : status === "normal"
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400 dark:text-slate-500"
              }`}>
                {raw !== null && raw !== undefined ? param.format(raw) : "—"}
              </p>

              <p className="text-[9px] text-gray-400 dark:text-slate-600 leading-none">
                Ideal: {threshold.min}–{threshold.max} {threshold.unit}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
