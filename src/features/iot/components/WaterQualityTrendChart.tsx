"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { TrendingUp, Calendar, Filter, Droplets, Thermometer, Wind, FlaskConical, Waves } from "lucide-react";
import { WATER_QUALITY_THRESHOLDS, type WaterQualityParam, type WaterQualityReading } from "@/shared/types/database.types";

interface WaterQualityTrendChartProps {
  ponds: Array<{ id: string; name: string }>;
  readingsHistory?: WaterQualityReading[];
}

const PARAM_OPTIONS: {
  key: WaterQualityParam;
  label: string;
  unit: string;
  icon: React.ElementType;
  color: string;
  stroke: string;
  fill: string;
}[] = [
  {
    key: "temperature",
    label: "Suhu Air",
    unit: "°C",
    icon: Thermometer,
    color: "text-orange-500",
    stroke: "#f97316",
    fill: "#ffedd5",
  },
  {
    key: "ph_level",
    label: "Kadar pH",
    unit: "",
    icon: FlaskConical,
    color: "text-purple-500",
    stroke: "#a855f7",
    fill: "#f3e8ff",
  },
  {
    key: "dissolved_oxygen",
    label: "Oksigen Terlarut (DO)",
    unit: "ppm",
    icon: Wind,
    color: "text-sky-500",
    stroke: "#0284c7",
    fill: "#e0f2fe",
  },
  {
    key: "salinity",
    label: "Salinitas",
    unit: "ppt",
    icon: Droplets,
    color: "text-blue-500",
    stroke: "#3b82f6",
    fill: "#dbeafe",
  },
  {
    key: "ammonia",
    label: "Amonia (NH3)",
    unit: "ppm",
    icon: Waves,
    color: "text-amber-600",
    stroke: "#d97706",
    fill: "#fef3c7",
  },
];

export function WaterQualityTrendChart({
  ponds,
  readingsHistory = [],
}: WaterQualityTrendChartProps) {
  const [selectedPondId, setSelectedPondId] = useState<string>(ponds[0]?.id || "");
  const [selectedParam, setSelectedParam] = useState<WaterQualityParam>("temperature");
  const [timeRange, setTimeRange] = useState<"24h" | "7d">("24h");

  const currentParamConfig = PARAM_OPTIONS.find((p) => p.key === selectedParam) || PARAM_OPTIONS[0];
  const threshold = WATER_QUALITY_THRESHOLDS[selectedParam];

  // Filter & format chart data
  const chartData = useMemo(() => {
    const pondReadings = readingsHistory.filter((r) => r.pond_id === selectedPondId);

    if (pondReadings.length > 0) {
      return pondReadings.map((r) => {
        const d = new Date(r.recorded_at);
        const timeStr = timeRange === "24h"
          ? d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
          : d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
        return {
          time: timeStr,
          value: r[selectedParam] !== null ? Number(r[selectedParam]) : null,
          fullDate: d.toLocaleString("id-ID"),
        };
      });
    }

    // Demo / Mock data generator if no real data exists yet
    const now = Date.now();
    const pointsCount = timeRange === "24h" ? 12 : 7;
    const intervalMs = timeRange === "24h" ? 2 * 3600 * 1000 : 24 * 3600 * 1000;

    const baseValues: Record<WaterQualityParam, number> = {
      temperature: 28.2,
      ph_level: 7.4,
      dissolved_oxygen: 6.5,
      salinity: 5.0,
      ammonia: 0.012,
      water_depth: 1.2,
    };

    const base = baseValues[selectedParam];

    return Array.from({ length: pointsCount }).map((_, i) => {
      const timestamp = new Date(now - (pointsCount - 1 - i) * intervalMs);
      const timeStr = timeRange === "24h"
        ? timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        : timestamp.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

      // Generate subtle realistic fluctuation
      const noise = (Math.sin(i * 1.5) * 0.4 + (Math.random() - 0.5) * 0.2) * (base * 0.08);
      const val = Math.max(0, Number((base + noise).toFixed(selectedParam === "ammonia" ? 4 : 2)));

      return {
        time: timeStr,
        value: val,
        fullDate: timestamp.toLocaleString("id-ID"),
      };
    });
  }, [readingsHistory, selectedPondId, selectedParam, timeRange]);

  if (ponds.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Chart Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/50">
              <TrendingUp size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Grafik Tren Kualitas Air
              </h2>
              <p className="text-xs text-muted-foreground dark:text-slate-400">
                Riwayat fluktuasi parameter sensor air & batas amannya
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Pond Selector */}
          {ponds.length > 1 && (
            <select
              value={selectedPondId}
              onChange={(e) => setSelectedPondId(e.target.value)}
              className="h-9 px-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-xs font-semibold text-gray-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-sky-500"
            >
              {ponds.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}

          {/* Time Range Toggle */}
          <div className="flex items-center p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setTimeRange("24h")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                timeRange === "24h"
                  ? "bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-xs"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              24 Jam
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("7d")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                timeRange === "7d"
                  ? "bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-xs"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              7 Hari
            </button>
          </div>
        </div>
      </div>

      {/* Parameter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PARAM_OPTIONS.map((param) => {
          const Icon = param.icon;
          const isActive = selectedParam === param.key;
          return (
            <button
              key={param.key}
              type="button"
              onClick={() => setSelectedParam(param.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                isActive
                  ? "bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 shadow-xs"
                  : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-500 dark:text-slate-400 hover:border-gray-200 dark:hover:border-slate-700"
              }`}
            >
              <Icon size={14} className={param.color} />
              <span>{param.label}</span>
            </button>
          );
        })}
      </div>

      {/* Threshold Info Banner */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Batas Aman Ideal {currentParamConfig.label}: <strong>{threshold.min} – {threshold.max} {threshold.unit}</strong></span>
        </div>
        {readingsHistory.length === 0 && (
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/50">
            Simulasi Grafik Demo
          </span>
        )}
      </div>

      {/* Recharts Render Area */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${selectedParam}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentParamConfig.stroke} stopOpacity={0.3} />
                <stop offset="95%" stopColor={currentParamConfig.stroke} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              dy={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              domain={["auto", "auto"]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-gray-900 dark:bg-slate-800 text-white p-3 rounded-xl shadow-xl border border-gray-700 text-xs space-y-1">
                      <p className="text-gray-400 font-semibold text-[10px]">{data.fullDate}</p>
                      <p className="text-sm font-extrabold text-sky-400">
                        {data.value} {currentParamConfig.unit}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Threshold Reference Lines */}
            <ReferenceLine y={threshold.min} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `Min: ${threshold.min}`, fill: "#ef4444", fontSize: 10, position: "insideBottomLeft" }} />
            <ReferenceLine y={threshold.max} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `Max: ${threshold.max}`, fill: "#ef4444", fontSize: 10, position: "insideTopLeft" }} />

            <Area
              type="monotone"
              dataKey="value"
              stroke={currentParamConfig.stroke}
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#gradient-${selectedParam})`}
              activeDot={{ r: 6, strokeWidth: 0, fill: currentParamConfig.stroke }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
