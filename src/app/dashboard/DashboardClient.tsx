"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import { formatCurrency } from "@/shared/lib/utils";
import {
  Fish,
  Wallet,
  TrendingUp,
  MapPin,
  Plus,
  ChevronRight,
  Droplets,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { FarmMap } from "@/features/farm/components/FarmMap";
import { FinancialTrendChart } from "@/shared/components/charts/FinancialTrendChart";

interface DashboardClientProps {
  displayName: string;
  greeting: string;
  dateStr: string;
  farmCount: number;
  totalPondsCount: number;
  activePondsCount: number;
  monthlyExpenses: number;
  monthlyRevenue: number;
  farms: any[];
  chartData: {
    monthIndex: number;
    year: number;
    expense: number;
    revenue: number;
  }[];
}

export function DashboardClient({
  displayName,
  greeting,
  dateStr,
  farmCount,
  totalPondsCount,
  activePondsCount,
  monthlyExpenses,
  monthlyRevenue,
  farms,
  chartData,
}: DashboardClientProps) {
  const { t, language } = useTranslation();
  const [localGreeting, setLocalGreeting] = useState(greeting);
  const [localDateStr, setLocalDateStr] = useState(dateStr);

  const localizedChartData = (chartData ?? []).map((pt) => {
    const tempDate = new Date(pt.year, pt.monthIndex, 1);
    const monthLabel = tempDate.toLocaleDateString(language === "en" ? "en-US" : "id-ID", {
      month: "short",
    });
    return {
      month: monthLabel,
      expense: pt.expense,
      revenue: pt.revenue,
    };
  });

  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    
    let computedGreeting = "";
    if (language === "en") {
      if (hours < 12) {
        computedGreeting = "Good morning";
      } else if (hours < 17) {
        computedGreeting = "Good afternoon";
      } else {
        computedGreeting = "Good evening";
      }
    } else {
      if (hours < 11) {
        computedGreeting = "Selamat pagi";
      } else if (hours < 15) {
        computedGreeting = "Selamat siang";
      } else if (hours < 18) {
        computedGreeting = "Selamat sore";
      } else {
        computedGreeting = "Selamat malam";
      }
    }
    setLocalGreeting(computedGreeting);

    const formattedDate = now.toLocaleDateString(language === "en" ? "en-US" : "id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setLocalDateStr(formattedDate);
  }, [language]);

  const stats = [
    {
      title: t.dashboard.totalFarms,
      value: String(farmCount ?? 0),
      unit: t.dashboard.farmsRegistered,
      icon: MapPin,
      gradient: "from-sky-500 to-cyan-400",
      shadowColor: "shadow-sky-200 dark:shadow-none",
      href: "/dashboard/farms",
    },
    {
      title: t.dashboard.activePonds,
      value: String(activePondsCount),
      unit: `${t.dashboard.outOfPonds} ${totalPondsCount}`,
      icon: Droplets,
      gradient: "from-violet-500 to-purple-400",
      shadowColor: "shadow-violet-200 dark:shadow-none",
      href: "/dashboard/ponds",
    },
    {
      title: t.dashboard.monthlyExpense,
      value: formatCurrency(monthlyExpenses),
      unit: t.dashboard.operationalThisMonth,
      icon: Wallet,
      gradient: "from-rose-500 to-pink-400",
      shadowColor: "shadow-rose-200 dark:shadow-none",
      href: "/dashboard/finance/expenses",
    },
    {
      title: t.dashboard.monthlyRevenue,
      value: formatCurrency(monthlyRevenue),
      unit: t.dashboard.harvestEstimate,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-400",
      shadowColor: "shadow-emerald-200 dark:shadow-none",
      href: "/dashboard/reports",
    },
  ];

  const quickActions = [
    {
      label: language === "en" ? "Add Farm" : "Tambah Farm",
      icon: MapPin,
      href: "/dashboard/farms",
      color: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 border-sky-200 dark:border-sky-800/50",
    },
    {
      label: language === "en" ? "Record Expense" : "Catat Pengeluaran",
      icon: Wallet,
      href: "/dashboard/finance/expenses",
      color: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border-rose-200 dark:border-rose-800/50",
    },
    {
      label: language === "en" ? "View Reports" : "Lihat Laporan",
      icon: Activity,
      href: "/dashboard/reports",
      color: "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/60 border-violet-200 dark:border-violet-800/50",
    },
    {
      label: language === "en" ? "Manage Ponds" : "Kelola Kolam",
      icon: Fish,
      href: "/dashboard/ponds",
      color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border-emerald-200 dark:border-emerald-800/50",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{localDateStr}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-0.5">
            {localGreeting},{" "}
            <span className="text-sky-600 dark:text-sky-400">{displayName}</span> 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t.dashboard.subtitle}
          </p>
        </div>
        <Link
          href="/dashboard/farms"
          className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-md shadow-sky-200 dark:shadow-none transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus size={16} />
          {t.dashboard.addFarmBtn}
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link href={stat.href} key={stat.title} className="group block h-full">
              <div
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.gradient} p-5 shadow-lg ${stat.shadowColor} transition-all duration-200 hover:-translate-y-1 hover:shadow-xl h-full flex flex-col justify-between`}
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute -right-8 -bottom-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />

                <div className="relative flex flex-col justify-between h-full space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="bg-white/20 rounded-xl p-2.5">
                      <Icon size={20} className="text-white" />
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-white/60 group-hover:text-white transition-colors"
                    />
                  </div>
                  <div>
                    <p className="text-white/80 text-xs font-medium uppercase tracking-wide">
                      {stat.title}
                    </p>
                    <p className="text-white text-2xl font-bold mt-1">
                      {stat.value}
                    </p>
                    <p className="text-white/70 text-xs mt-0.5 font-medium">{stat.unit}</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Modern Financial Trend Chart */}
      <FinancialTrendChart data={localizedChartData} />

      {/* Map Section */}
      <FarmMap farms={farms ?? []} />

      {/* Quick Actions + Getting Started */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            {language === "en" ? "Quick Actions" : "Aksi Cepat"}
          </h2>
          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${action.color}`}
                >
                  <Icon size={16} />
                  {action.label}
                  <ChevronRight size={14} className="ml-auto opacity-50" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-slate-900 dark:to-slate-850 border border-sky-100 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-sky-200/50 dark:border-sky-800/50">
              <Activity size={12} />
              {language === "en" ? "Your Operational Progress" : "Kemajuan Operasional Anda"}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {language === "en" ? "Welcome to PondFlow!" : "Selamat datang di PondFlow!"} 🐟
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-300 mt-2 leading-relaxed">
              {language === "en"
                ? "Monitor all aquaculture activities, pond management, and financial reports in one integrated system."
                : "Pantau seluruh aktivitas budidaya, pengelolaan kolam, dan laporan keuangan Anda secara terpadu."}
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {[
              {
                step: "1",
                label: language === "en" ? "Add farm location" : "Tambah lokasi farm / tambak",
                done: farmCount > 0,
              },
              {
                step: "2",
                label: language === "en" ? "Register aquaculture ponds" : "Daftarkan kolam budidaya",
                done: totalPondsCount > 0,
              },
              {
                step: "3",
                label: language === "en" ? "Start cycle & fish stocking" : "Mulai siklus budidaya & tebar benih",
                done: activePondsCount > 0,
              },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    item.done
                      ? "bg-sky-500 text-white"
                      : "bg-white dark:bg-slate-800 border-2 border-sky-200 dark:border-sky-700 text-sky-400"
                  }`}
                >
                  {item.done ? "✓" : item.step}
                </div>
                <span
                  className={`text-sm ${item.done ? "line-through text-gray-400 dark:text-slate-500 font-medium" : "text-gray-700 dark:text-slate-200 font-semibold"}`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/ponds"
            className="mt-6 inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-sky-200 dark:shadow-none transition-all hover:shadow-lg w-fit"
          >
            <Fish size={16} />
            {language === "en" ? "Manage Ponds Now" : "Kelola Kolam Sekarang"}
          </Link>
        </div>
      </div>
    </div>
  );
}
