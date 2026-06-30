"use client";

import { useState } from "react";
import { TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, CircleDollarSign, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChartDataPoint {
  month: string;
  expense: number;
  revenue: number;
}

interface FinancialTrendChartProps {
  expenses?: { amount: number; expense_date: string }[];
  harvests?: { weight_kg: number | null; harvest_date: string }[];
}

export function FinancialTrendChart({ expenses, harvests }: FinancialTrendChartProps) {
  const { t, language } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<"week" | "month" | "6months" | "year">("6months");

  const now = new Date();
  let chartData: ChartDataPoint[] = [];
  const hasProps = expenses !== undefined || harvests !== undefined;

  if (!hasProps) {
    // Fallback to dummy data
    chartData = [
      { month: language === "en" ? "Jan" : "Jan", expense: 1200000, revenue: 3500000 },
      { month: language === "en" ? "Feb" : "Feb", expense: 1800000, revenue: 4200000 },
      { month: language === "en" ? "Mar" : "Mar", expense: 2100000, revenue: 4800000 },
      { month: language === "en" ? "Apr" : "Apr", expense: 1500000, revenue: 3900000 },
      { month: language === "en" ? "May" : "Mei", expense: 2900000, revenue: 6100000 },
      { month: language === "en" ? "Jun" : "Jun", expense: 2400000, revenue: 5800000 },
    ];
  } else {
    const safeExpenses = expenses || [];
    const safeHarvests = harvests || [];

    if (filterType === "week") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const label = d.toLocaleDateString(language === "en" ? "en-US" : "id-ID", { weekday: "short", day: "numeric" });
        chartData.push({
          month: label,
          expense: 0,
          revenue: 0,
          // Custom check properties
          _dateKey: d.toDateString(),
        } as any);
      }

      safeExpenses.forEach((exp) => {
        const d = new Date(exp.expense_date);
        const match = chartData.find((c: any) => c._dateKey === d.toDateString());
        if (match) match.expense += Number(exp.amount || 0);
      });

      safeHarvests.forEach((harv) => {
        const d = new Date(harv.harvest_date);
        const match = chartData.find((c: any) => c._dateKey === d.toDateString());
        if (match) match.revenue += Number(harv.weight_kg || 0) * 23000;
      });

    } else if (filterType === "month") {
      // Days of this month
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(now.getFullYear(), now.getMonth(), day);
        chartData.push({
          month: String(day),
          expense: 0,
          revenue: 0,
          _dateKey: d.toDateString(),
        } as any);
      }

      safeExpenses.forEach((exp) => {
        const d = new Date(exp.expense_date);
        const match = chartData.find((c: any) => c._dateKey === d.toDateString());
        if (match) match.expense += Number(exp.amount || 0);
      });

      safeHarvests.forEach((harv) => {
        const d = new Date(harv.harvest_date);
        const match = chartData.find((c: any) => c._dateKey === d.toDateString());
        if (match) match.revenue += Number(harv.weight_kg || 0) * 23000;
      });

    } else if (filterType === "6months") {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString(language === "en" ? "en-US" : "id-ID", { month: "short" });
        chartData.push({
          month: label,
          expense: 0,
          revenue: 0,
          _monthIndex: d.getMonth(),
          _year: d.getFullYear(),
        } as any);
      }

      safeExpenses.forEach((exp) => {
        const d = new Date(exp.expense_date);
        const match = chartData.find((c: any) => c._monthIndex === d.getMonth() && c._year === d.getFullYear());
        if (match) match.expense += Number(exp.amount || 0);
      });

      safeHarvests.forEach((harv) => {
        const d = new Date(harv.harvest_date);
        const match = chartData.find((c: any) => c._monthIndex === d.getMonth() && c._year === d.getFullYear());
        if (match) match.revenue += Number(harv.weight_kg || 0) * 23000;
      });

    } else if (filterType === "year") {
      // 12 months of this year
      for (let month = 0; month < 12; month++) {
        const d = new Date(now.getFullYear(), month, 1);
        const label = d.toLocaleDateString(language === "en" ? "en-US" : "id-ID", { month: "short" });
        chartData.push({
          month: label,
          expense: 0,
          revenue: 0,
          _monthIndex: month,
          _year: now.getFullYear(),
        } as any);
      }

      safeExpenses.forEach((exp) => {
        const d = new Date(exp.expense_date);
        const match = chartData.find((c: any) => c._monthIndex === d.getMonth() && c._year === d.getFullYear());
        if (match) match.expense += Number(exp.amount || 0);
      });

      safeHarvests.forEach((harv) => {
        const d = new Date(harv.harvest_date);
        const match = chartData.find((c: any) => c._monthIndex === d.getMonth() && c._year === d.getFullYear());
        if (match) match.revenue += Number(harv.weight_kg || 0) * 23000;
      });
    }
  }

  const defaultData = chartData;

  // Hitung total statistik
  const totalRevenue = defaultData.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpense = defaultData.reduce((sum, d) => sum + d.expense, 0);
  const netProfit = totalRevenue - totalExpense;

  // Mencari nilai tertinggi dan terendah dari seluruh data (revenue & expense)
  let highestVal = -Infinity;
  let highestMonth = "";
  let highestType: "revenue" | "expense" = "revenue";

  let lowestVal = Infinity;
  let lowestMonth = "";
  let lowestType: "revenue" | "expense" = "expense";

  defaultData.forEach((d) => {
    // Check Revenue
    if (d.revenue > highestVal) {
      highestVal = d.revenue;
      highestMonth = d.month;
      highestType = "revenue";
    }
    if (d.revenue < lowestVal) {
      lowestVal = d.revenue;
      lowestMonth = d.month;
      lowestType = "revenue";
    }
    // Check Expense
    if (d.expense > highestVal) {
      highestVal = d.expense;
      highestMonth = d.month;
      highestType = "expense";
    }
    if (d.expense < lowestVal) {
      lowestVal = d.expense;
      lowestMonth = d.month;
      lowestType = "expense";
    }
  });

  const maxVal = Math.max(highestVal * 1.15, 7000000); // 15% padding untuk ruang label di atas bar

  const formatCompactCurrency = (value: number) => {
    if (value >= 1000000) {
      const num = value / 1000000;
      const formatted = num % 1 === 0 ? num.toString() : num.toFixed(1).replace(".", ",");
      const suffix = language === "en" ? "M" : "jt";
      return `Rp ${formatted}${suffix}`;
    }
    if (value >= 1000) {
      const num = value / 1000;
      const formatted = num % 1 === 0 ? num.toString() : num.toFixed(0);
      const suffix = language === "en" ? "K" : "rb";
      return `Rp ${formatted}${suffix}`;
    }
    return `Rp ${value}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-4">
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
            {filterType === "week"
              ? (language === "en" ? "Daily operational expenses and harvest revenue (Last 7 Days)" : "Pengeluaran operasional dan hasil pemasukan panen harian (7 Hari Terakhir)")
              : filterType === "month"
                ? (language === "en" ? "Daily operational expenses and harvest revenue (This Month)" : "Pengeluaran operasional dan hasil pemasukan panen harian (Bulan Ini)")
                : filterType === "6months"
                  ? (language === "en" ? "Comparison between operational expenses and harvest revenue (Last 6 Months)" : "Perbandingan antara pengeluaran operasional dan hasil pemasukan panen (6 Bulan Terakhir)")
                  : (language === "en" ? "Monthly operational expenses and harvest revenue (This Year)" : "Pengeluaran operasional dan hasil pemasukan panen bulanan (Tahun Ini)")}
          </p>
        </div>

        {/* Legend & Filter Controls */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 text-xs font-bold bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none cursor-pointer transition-colors shadow-xs select-none">
              {filterType === "week"
                ? (language === "en" ? "This Week" : "Minggu Ini")
                : filterType === "month"
                  ? (language === "en" ? "This Month" : "Bulan Ini")
                  : filterType === "6months"
                    ? (language === "en" ? "Last 6 Months" : "6 Bulan Terakhir")
                    : (language === "en" ? "This Year" : "Tahun Ini")}
              <ChevronDown size={14} className="opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-gray-100 dark:border-slate-800 shadow-xl p-1 z-50">
              <DropdownMenuItem
                onClick={() => setFilterType("week")}
                className={`text-xs font-semibold px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${filterType === "week" ? "bg-sky-500 text-white focus:bg-sky-500 focus:text-white" : "text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 focus:text-gray-800 dark:focus:bg-slate-800 dark:focus:text-slate-100"}`}
              >
                {language === "en" ? "This Week" : "Minggu Ini"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterType("month")}
                className={`text-xs font-semibold px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${filterType === "month" ? "bg-sky-500 text-white focus:bg-sky-500 focus:text-white" : "text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 focus:text-gray-800 dark:focus:bg-slate-800 dark:focus:text-slate-100"}`}
              >
                {language === "en" ? "This Month" : "Bulan Ini"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterType("6months")}
                className={`text-xs font-semibold px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${filterType === "6months" ? "bg-sky-500 text-white focus:bg-sky-500 focus:text-white" : "text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 focus:text-gray-800 dark:focus:bg-slate-800 dark:focus:text-slate-100"}`}
              >
                {language === "en" ? "Last 6 Months" : "6 Bulan Terakhir"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterType("year")}
                className={`text-xs font-semibold px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${filterType === "year" ? "bg-sky-500 text-white focus:bg-sky-500 focus:text-white" : "text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 focus:text-gray-800 dark:focus:bg-slate-800 dark:focus:text-slate-100"}`}
              >
                {language === "en" ? "This Year" : "Tahun Ini"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-gradient-to-tr from-sky-500 to-cyan-400" />
              <span className="text-gray-700 dark:text-slate-300">
                {language === "en" ? "Est. Revenue" : "Est. Pemasukan"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-gradient-to-tr from-rose-500 to-pink-400" />
              <span className="text-gray-700 dark:text-slate-300">
                {language === "en" ? "Expense" : "Pengeluaran"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Revenue */}
        <div className="bg-sky-50/40 dark:bg-sky-950/20 border border-sky-100/50 dark:border-sky-900/30 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500 text-white flex items-center justify-center">
            <ArrowUpRight size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-sky-600 dark:text-sky-400">
              {language === "en" ? "Total Revenue" : "Total Pemasukan"}
            </p>
            <p className="text-sm font-extrabold text-gray-900 dark:text-white">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-pink-50/40 dark:bg-pink-950/20 border border-pink-100/50 dark:border-pink-900/30 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-pink-500 text-white flex items-center justify-center">
            <ArrowDownRight size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-pink-600 dark:text-pink-400">
              {language === "en" ? "Total Expense" : "Total Pengeluaran"}
            </p>
            <p className="text-sm font-extrabold text-gray-900 dark:text-white">
              {formatCurrency(totalExpense)}
            </p>
          </div>
        </div>

        {/* Net Profit */}
        <div className={`border rounded-xl p-3 flex items-center gap-3 ${
          netProfit >= 0
            ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-100/50 dark:border-emerald-900/30"
            : "bg-red-50/40 dark:bg-red-950/20 border-red-100/50 dark:border-red-900/30"
        }`}>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${
            netProfit >= 0 ? "bg-emerald-500" : "bg-red-500"
          }`}>
            <CircleDollarSign size={18} />
          </div>
          <div>
            <p className={`text-[10px] uppercase tracking-wider font-bold ${
              netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            }`}>
              {language === "en" ? "Net Profit" : "Laba Bersih"}
            </p>
            <p className="text-sm font-extrabold text-gray-900 dark:text-white">
              {formatCurrency(netProfit)}
            </p>
          </div>
        </div>
      </div>

      {/* Chart Area with Grid and Axis */}
      <div className="relative pt-4 pb-2">
        <div className="flex h-48 sm:h-56">
          {/* Y-Axis Labels */}
          <div className="flex flex-col justify-between text-[10px] text-gray-400 dark:text-slate-500 font-bold pr-3 text-right select-none pb-7 pt-4 w-12 border-r border-gray-100 dark:border-slate-800/80">
            <span>{formatCompactCurrency(maxVal)}</span>
            <span>{formatCompactCurrency(maxVal * 0.75)}</span>
            <span>{formatCompactCurrency(maxVal * 0.5)}</span>
            <span>{formatCompactCurrency(maxVal * 0.25)}</span>
            <span>Rp 0</span>
          </div>

          {/* Grid Area */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden relative h-full flex items-end justify-between gap-1.5 sm:gap-4 px-3 min-w-[280px]">
            {/* Background Grid Lines */}
            <div className="absolute inset-x-0 bottom-7 top-4 flex flex-col justify-between pointer-events-none opacity-50 dark:opacity-30">
              <div className="border-b border-dashed border-gray-100 dark:border-slate-800 w-full" />
              <div className="border-b border-dashed border-gray-100 dark:border-slate-800 w-full" />
              <div className="border-b border-dashed border-gray-100 dark:border-slate-800 w-full" />
              <div className="border-b border-dashed border-gray-100 dark:border-slate-800 w-full" />
            </div>

            {/* Bars Mapping */}
            {defaultData.map((pt, idx) => {
              const revHeightPct = Math.min(100, Math.max(8, (pt.revenue / maxVal) * 100));
              const expHeightPct = Math.min(100, Math.max(8, (pt.expense / maxVal) * 100));
              const isHovered = hoveredIndex === idx;

              const isHighestRevenue = pt.month === highestMonth && highestType === "revenue";
              const isHighestExpense = pt.month === highestMonth && highestType === "expense";
              const isLowestRevenue = pt.month === lowestMonth && lowestType === "revenue";
              const isLowestExpense = pt.month === lowestMonth && lowestType === "expense";

              return (
                <div
                  key={pt.month}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`flex-1 ${filterType === "month" ? "min-w-[24px] sm:min-w-[32px]" : "min-w-[40px] sm:min-w-[48px]"} shrink-0 flex flex-col items-center h-full justify-end group relative cursor-pointer z-10`}
                >
                  {/* Floating Hover Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-16 z-30 bg-gray-900 dark:bg-slate-800 text-white p-2.5 rounded-xl shadow-xl border border-gray-700 dark:border-slate-700 text-[11px] whitespace-nowrap space-y-1 animate-in fade-in zoom-in-95 duration-150">
                      <p className="font-bold text-gray-300 border-b border-gray-700 dark:border-slate-700 pb-0.5 mb-1">
                        {pt.month}
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sky-400 font-semibold">
                          {language === "en" ? "Revenue:" : "Pemasukan:"}
                        </span>
                        <span className="font-extrabold">{formatCurrency(pt.revenue)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-pink-400 font-semibold">
                          {language === "en" ? "Expense:" : "Pengeluaran:"}
                        </span>
                        <span className="font-extrabold">{formatCurrency(pt.expense)}</span>
                      </div>
                    </div>
                  )}

                  {/* Persistent Highest / Lowest Popup for Expense Bar */}
                  {(isHighestExpense || isLowestExpense) && (
                    <div
                      style={{ bottom: `calc(${expHeightPct}% + 10px)`, left: "calc(50% - 10px)" }}
                      className={`absolute z-25 -translate-x-1/2 px-1.5 py-0.5 rounded-md text-[8px] font-extrabold whitespace-nowrap shadow-sm border select-none ${
                        isHighestExpense
                          ? "bg-rose-600 border-rose-500 text-white shadow-rose-500/20 animate-pulse"
                          : "bg-pink-500 border-pink-400 text-white shadow-pink-500/20 animate-pulse"
                      }`}
                    >
                      <span className="flex items-center gap-0.5">
                        {isHighestExpense ? "▲" : "▼"} {formatCompactCurrency(pt.expense)}
                      </span>
                      <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 ${
                        isHighestExpense ? "border-t-rose-600" : "border-t-pink-500"
                      }`} />
                    </div>
                  )}

                  {/* Persistent Highest / Lowest Popup for Revenue Bar */}
                  {(isHighestRevenue || isLowestRevenue) && (
                    <div
                      style={{ bottom: `calc(${revHeightPct}% + 10px)`, left: "calc(50% + 10px)" }}
                      className={`absolute z-25 -translate-x-1/2 px-1.5 py-0.5 rounded-md text-[8px] font-extrabold whitespace-nowrap shadow-sm border select-none ${
                        isHighestRevenue
                          ? "bg-sky-600 dark:bg-sky-500 border-sky-500 text-white shadow-sky-500/20 animate-pulse"
                          : "bg-amber-500 border-amber-400 text-white shadow-amber-500/20 animate-pulse"
                      }`}
                    >
                      <span className="flex items-center gap-0.5">
                        {isHighestRevenue ? "▲" : "▼"} {formatCompactCurrency(pt.revenue)}
                      </span>
                      <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 ${
                        isHighestRevenue ? "border-t-sky-600 dark:border-t-sky-500" : "border-t-amber-500"
                      }`} />
                    </div>
                  )}

                  {/* Dual Bars Container */}
                  <div className="w-full max-w-[48px] flex items-end justify-center gap-1.5 h-full pt-4">
                    {/* Expense Bar */}
                    <div
                      style={{ height: `${expHeightPct}%` }}
                      className={`w-1/2 rounded-t-md bg-gradient-to-t from-rose-600 to-pink-400 transition-all duration-300 ${
                        isHovered ? "opacity-100 scale-x-110 shadow-md shadow-rose-500/20" : "opacity-85"
                      } ${isHighestExpense || isLowestExpense ? "ring-2 ring-white dark:ring-slate-900" : ""}`}
                    />
                    {/* Revenue Bar */}
                    <div
                      style={{ height: `${revHeightPct}%` }}
                      className={`w-1/2 rounded-t-md bg-gradient-to-t from-sky-600 to-cyan-400 transition-all duration-300 ${
                        isHovered ? "opacity-100 scale-x-110 shadow-md shadow-sky-500/20" : "opacity-85"
                      } ${isHighestRevenue || isLowestRevenue ? "ring-2 ring-white dark:ring-slate-900" : ""}`}
                    />
                  </div>

                  {/* Month Label */}
                  <span className={`text-[11px] font-semibold mt-3 transition-colors ${
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
    </div>
  );
}
