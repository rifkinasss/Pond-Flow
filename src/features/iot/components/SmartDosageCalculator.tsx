"use client";

import { useState } from "react";
import { Calculator, Sparkles, Scale, Percent } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";

export function SmartDosageCalculator() {
  const [fishCount, setFishCount] = useState<string>("5000");
  const [avgWeightGram, setAvgWeightGram] = useState<string>("100"); // 100 gram
  const [feedingRatePct, setFeedingRatePct] = useState<string>("3.5"); // 3.5%

  const count = parseFloat(fishCount) || 0;
  const avgWeightKg = (parseFloat(avgWeightGram) || 0) / 1000;
  const totalBiomassKg = count * avgWeightKg;
  const fr = (parseFloat(feedingRatePct) || 0) / 100;
  const dailyFeedKg = totalBiomassKg * fr;
  const estimatedCostPerDay = dailyFeedKg * 12500; // Rp 12.500 / kg

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50">
          <Calculator size={20} />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            Kalkulator Dosis Pakan Cerdas (Biomassa & FR)
            <Sparkles size={16} className="text-amber-500" />
          </h2>
          <p className="text-xs text-muted-foreground dark:text-slate-400">
            Hitung rekomendasi pakan harian otomatis agar pertumbuhan optimal tanpa pemborosan
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-200">Jumlah Populasi (Ekor)</label>
          <input
            type="number"
            value={fishCount}
            onChange={(e) => setFishCount(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-200">Rata-rata Berat (Gram/Ekor)</label>
          <input
            type="number"
            value={avgWeightGram}
            onChange={(e) => setAvgWeightGram(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-slate-200">Feeding Rate / FR (%)</label>
          <input
            type="number"
            step="0.1"
            value={feedingRatePct}
            onChange={(e) => setFeedingRatePct(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Output Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40 rounded-xl p-3.5 space-y-1">
          <p className="text-[11px] text-sky-700 dark:text-sky-300 font-semibold">Total Est. Biomassa</p>
          <p className="text-xl font-extrabold text-sky-900 dark:text-sky-100">
            {totalBiomassKg.toLocaleString("id-ID")} <span className="text-xs">Kg</span>
          </p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-3.5 space-y-1">
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">Rekomendasi Pakan Harian</p>
          <p className="text-xl font-extrabold text-emerald-900 dark:text-emerald-100">
            {dailyFeedKg.toFixed(1)} <span className="text-xs">Kg / hari</span>
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 rounded-xl p-3.5 space-y-1">
          <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold">Estimasi Budget Pakan / Hari</p>
          <p className="text-xl font-extrabold text-amber-900 dark:text-amber-100">
            {formatCurrency(estimatedCostPerDay)}
          </p>
        </div>
      </div>
    </div>
  );
}
