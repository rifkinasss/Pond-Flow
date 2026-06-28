"use client";

import { useState } from "react";
import { TrendingUp, Calendar, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";
import { useTranslation } from "@/shared/i18n/LanguageContext";

interface ChartDataPoint {
  month: string;
  expense: number;
  revenue: number;
}

interface FinancialTrendChartProps {
  data?: ChartDataPoint[];
}

export function FinancialTrendChart({ data }: FinancialTrendChartProps) {
  const { t, language } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const defaultData: ChartDataPoint[] = data && data.length > 0 ? data : [
    { month: language === "en" ? "Jan" : "Jan", expense: 1200000, revenue: 3500000 },
    { month: language === "en" ? "Feb" : "Feb", expense: 1800000, revenue: 4200000 },
    { month: language === "en" ? "Mar" : "Mar", expense: 2100000, revenue: 4800000 },
    { month: language === "en" ? "Apr" : "Apr", expense: 1500000, revenue: 3900000 },
    { month: language === "en" ? "May" : "Mei", expense: 2900000, revenue: 6100000 },
    { month: language === "en" ? "Jun" : "Jun", expense: 2400000, revenue: 5800000 },
  ];

  const maxVal = Math.max(...defaultData.map((d) => Math.max(d.expense, d.revenue)), 7000000);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/50">
              <TrendingUp size={18} />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {language === "en" ? "Financial Trend Analysis" : "Tren Analisis Finansial Budidaya"}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">
            {language === "en"
              ? "Comparison between operational expenses and harvest revenue (Last 6 Months)"
              : "Perbandingan antara pengeluaran operasional dan hasil pemasukan panen (6 Bulan Terakhir)"}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-gradient-to-tr from-sky-500 to-cyan-400" />
            <span className="text-gray-700 dark:text-slate-300">{language === "en" ? "Est. Revenue" : "Est. Pemasukan"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-gradient-to-tr from-rose-500 to-pink-400" />
            <span className="text-gray-700 dark:text-slate-300">{language === "en" ? "Expense" : "Pengeluaran"}</span>
          </div>
        </div>
      </div>

      {/* SVG Bars & Area Chart */}
      <div className="relative pt-4 pb-2">
        <div className="h-48 sm:h-56 flex items-end justify-between gap-2 sm:gap-6 px-2">
          {defaultData.map((pt, idx) => {
            const revHeightPct = Math.min(100, Math.max(8, (pt.revenue / maxVal) * 100));
            const expHeightPct = Math.min(100, Math.max(8, (pt.expense / maxVal) * 100));
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={pt.month}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              >
                {/* Floating Sleek Tooltip */}
                {isHovered && (
                  <div className="absolute -top-16 z-20 bg-gray-900 dark:bg-slate-800 text-white p-2.5 rounded-xl shadow-xl border border-gray-700 text-[11px] whitespace-nowrap space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <p className="font-bold text-gray-300 border-b border-gray-700 pb-0.5 mb-1">{pt.month}</p>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-emerald-400 font-semibold">Pemasukan:</span>
                      <span className="font-extrabold">{formatCurrency(pt.revenue)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-rose-400 font-semibold">Pengeluaran:</span>
                      <span className="font-extrabold">{formatCurrency(pt.expense)}</span>
                    </div>
                  </div>
                )}

                {/* Dual Bars Container */}
                <div className="w-full max-w-[48px] flex items-end justify-center gap-1.5 h-full pt-4">
                  {/* Expense Bar */}
                  <div
                    style={{ height: `${expHeightPct}%` }}
                    className={`w-1/2 rounded-t-lg bg-gradient-to-t from-rose-600 to-pink-400 transition-all duration-300 ${
                      isHovered ? "opacity-100 scale-x-110 shadow-md shadow-rose-500/20" : "opacity-85"
                    }`}
                  />
                  {/* Revenue Bar */}
                  <div
                    style={{ height: `${revHeightPct}%` }}
                    className={`w-1/2 rounded-t-lg bg-gradient-to-t from-sky-600 to-cyan-400 transition-all duration-300 ${
                      isHovered ? "opacity-100 scale-x-110 shadow-md shadow-sky-500/20" : "opacity-85"
                    }`}
                  />
                </div>

                {/* Month Label */}
                <span className={`text-xs font-semibold mt-3 transition-colors ${
                  isHovered ? "text-sky-500 dark:text-sky-400 font-bold" : "text-gray-500 dark:text-slate-400"
                }`}>
                  {pt.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
