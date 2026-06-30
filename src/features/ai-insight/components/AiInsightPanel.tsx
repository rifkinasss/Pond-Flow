"use client";

import type { PredictionResult } from "@/features/ai-insight/engine/predictionEngine";
import { Brain, Calendar, Fish, TrendingUp, Droplets, AlertTriangle, Info, CheckCircle2, Zap, Target } from "lucide-react";

interface AiInsightPanelProps {
  result: PredictionResult;
}

const GRADE_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  A: { bg: "bg-emerald-500", text: "text-white",          border: "border-emerald-400", label: "Sangat Baik" },
  B: { bg: "bg-sky-500",     text: "text-white",          border: "border-sky-400",     label: "Baik" },
  C: { bg: "bg-amber-500",   text: "text-white",          border: "border-amber-400",   label: "Cukup" },
  D: { bg: "bg-red-500",     text: "text-white",          border: "border-red-400",     label: "Perlu Perhatian" },
};

const CONFIDENCE_STYLES: Record<string, { color: string; label: string }> = {
  high:   { color: "text-emerald-600 dark:text-emerald-400", label: "Akurasi Tinggi" },
  medium: { color: "text-amber-600 dark:text-amber-400",     label: "Akurasi Sedang" },
  low:    { color: "text-gray-400 dark:text-slate-500",      label: "Akurasi Rendah (tambahkan log pakan)" },
};

const ALERT_STYLES = {
  critical: { bg: "bg-red-50 dark:bg-red-950/40",    border: "border-red-200 dark:border-red-800/50",    icon: AlertTriangle,  text: "text-red-700 dark:text-red-300" },
  warning:  { bg: "bg-amber-50 dark:bg-amber-950/40",border: "border-amber-200 dark:border-amber-800/50",icon: AlertTriangle,  text: "text-amber-700 dark:text-amber-300" },
  info:     { bg: "bg-sky-50 dark:bg-sky-950/40",    border: "border-sky-200 dark:border-sky-800/50",    icon: Info,           text: "text-sky-700 dark:text-sky-300" },
};

function MetricCell({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 space-y-2">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon size={16} />
      </div>
      <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-lg font-extrabold text-gray-900 dark:text-white leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-gray-400 dark:text-slate-500">{sub}</p>}
    </div>
  );
}

function GaugeBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="relative w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function AiInsightPanel({ result }: AiInsightPanelProps) {
  const grade = GRADE_STYLES[result.grade] ?? GRADE_STYLES.D;
  const confidence = CONFIDENCE_STYLES[result.confidence];

  const formatRp = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  const harvestDateFormatted = new Date(result.optimal_harvest_date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 p-5 pb-4 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-200 dark:shadow-none">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              AI Insight
              <span className="text-xs font-medium text-gray-400 dark:text-slate-500">— {result.pond_name}</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {result.fish_type} · {result.days_elapsed} hari budidaya
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Grade badge */}
          <div className={`w-12 h-12 rounded-xl ${grade.bg} ${grade.border} border-2 flex flex-col items-center justify-center shadow-sm`}>
            <span className={`text-xl font-black ${grade.text}`}>{result.grade}</span>
          </div>
        </div>
      </div>

      {/* ── Harvest Countdown ────────────────────────────────────── */}
      <div className="mx-5 my-4 p-4 rounded-xl bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-950/30 dark:to-cyan-950/30 border border-sky-100 dark:border-sky-800/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-sky-600 dark:text-sky-400" />
            <span className="text-xs font-semibold text-sky-700 dark:text-sky-300 uppercase tracking-wide">
              Rekomendasi Panen
            </span>
          </div>
          {result.temperature_growth_factor !== 1.0 && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/50 font-medium">
              Dikoreksi suhu {result.avg_temperature_7d}°C
            </span>
          )}
        </div>
        <div className="mt-2 flex items-end gap-4">
          <div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              {result.days_to_harvest === 0
                ? "🎉 Siap Panen!"
                : `${result.days_to_harvest} hari lagi`}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{harvestDateFormatted}</p>
          </div>
          <div className="flex-1 text-right">
            <p className="text-xs text-gray-400 dark:text-slate-500">Est. hasil panen</p>
            <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              {result.estimated_harvest_kg} kg
            </p>
            <p className="text-xs text-emerald-500 dark:text-emerald-500 font-semibold">
              {formatRp(result.estimated_revenue)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Metrics Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 px-5 pb-4">
        <MetricCell
          label="Survival Rate"
          value={`${result.survival_rate_pct.toFixed(1)}%`}
          sub={`${result.fish_type} — target ≥85%`}
          icon={Fish}
          accent="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
        />
        <MetricCell
          label="FCR Aktual"
          value={result.fcr_actual > 0 ? result.fcr_actual.toFixed(2) : "—"}
          sub={`Target: ${result.fcr_target} · Efisiensi: ${result.feed_efficiency_pct}%`}
          icon={Target}
          accent="bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400"
        />
        <MetricCell
          label="Total Pakan"
          value={`${result.total_feed_kg} kg`}
          sub={`${result.days_elapsed} hari budidaya`}
          icon={Zap}
          accent="bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
        />
        <MetricCell
          label="Suhu Rata-rata"
          value={result.avg_temperature_7d !== null ? `${result.avg_temperature_7d}°C` : "—"}
          sub={result.avg_temperature_7d !== null ? `Faktor: ×${result.temperature_growth_factor}` : "Sensor belum aktif"}
          icon={Droplets}
          accent="bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400"
        />
      </div>

      {/* ── Gauge bars ───────────────────────────────────────────── */}
      <div className="px-5 pb-4 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-slate-400">
            <span>Survival Rate</span>
            <span>{result.survival_rate_pct.toFixed(1)}%</span>
          </div>
          <GaugeBar
            value={result.survival_rate_pct}
            color={
              result.survival_rate_pct >= 85
                ? "bg-emerald-500"
                : result.survival_rate_pct >= 70
                  ? "bg-amber-500"
                  : "bg-red-500"
            }
          />
        </div>

        {result.feed_efficiency_pct > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-slate-400">
              <span>Efisiensi Pakan</span>
              <span>{result.feed_efficiency_pct}%</span>
            </div>
            <GaugeBar
              value={result.feed_efficiency_pct}
              max={150}
              color={
                result.feed_efficiency_pct >= 90
                  ? "bg-emerald-500"
                  : result.feed_efficiency_pct >= 70
                    ? "bg-amber-500"
                    : "bg-red-500"
              }
            />
          </div>
        )}
      </div>

      {/* ── Alerts ───────────────────────────────────────────────── */}
      {result.alerts.length > 0 && (
        <div className="px-5 pb-5 space-y-2">
          <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Rekomendasi</p>
          {result.alerts.map((alert, i) => {
            const style = ALERT_STYLES[alert.severity];
            const Icon = style.icon;
            return (
              <div
                key={i}
                className={`flex items-start gap-2.5 p-3 rounded-xl border ${style.bg} ${style.border}`}
              >
                <Icon size={14} className={`shrink-0 mt-0.5 ${style.text}`} />
                <p className={`text-xs font-medium leading-snug ${style.text}`}>{alert.message}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer: Confidence ───────────────────────────────────── */}
      <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <p className={`text-[11px] font-semibold ${confidence.color}`}>
          🤖 {confidence.label}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-slate-600">
          {new Date(result.generated_at).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
