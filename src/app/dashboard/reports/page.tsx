import type { Metadata } from "next";
import { createClient } from "@/shared/lib/supabase/server";
import { TrendingUp, TrendingDown, DollarSign, Scale, PieChart, Layers, MapPin, Filter, AlertCircle, Award } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";
import Link from "next/link";
import type { Farm, Pond, PondCycle, Harvest, Expense, FeedingLog } from "@/shared/types/database.types";

import { ExportPdfButton } from "@/features/reports/components/ExportPdfButton";

export const metadata: Metadata = { title: "Laporan Budidaya & HPP" };

interface PageProps {
  searchParams: Promise<{ farm?: string }>;
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedFarmId = params.farm;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Ambil semua farm milik user
  const { data: farmsData } = await supabase
    .from("farms")
    .select("id, name")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  const farms: Array<{ id: string; name: string }> = farmsData ?? [];
  const farmIds = farms.map((f) => f.id);

  // 2. Ambil kolam milik farm user
  let queryPonds = supabase.from("ponds").select("*");
  if (farmIds.length > 0) {
    queryPonds = queryPonds.in("farm_id", farmIds);
  } else {
    queryPonds = queryPonds.eq("farm_id", "00000000-0000-0000-0000-000000000000");
  }
  if (selectedFarmId) {
    queryPonds = queryPonds.eq("farm_id", selectedFarmId);
  }
  const { data: pondsData } = await queryPonds;
  const ponds: Pond[] = pondsData ?? [];
  const pondIds = ponds.map((p) => p.id);

  // 3. Ambil siklus (cycles) untuk kolam-kolam ini
  let cycles: PondCycle[] = [];
  if (pondIds.length > 0) {
    const { data: cyclesData } = await supabase
      .from("pond_cycles")
      .select("*")
      .in("pond_id", pondIds);
    cycles = cyclesData ?? [];
  }
  const cycleIds = cycles.map((c) => c.id);

  // 4. Ambil data Panen (Harvests)
  let harvests: Harvest[] = [];
  if (cycleIds.length > 0) {
    const { data: harvestsData } = await supabase
      .from("harvests")
      .select("*")
      .in("cycle_id", cycleIds);
    harvests = harvestsData ?? [];
  }

  // 5. Ambil data Pengeluaran (Expenses)
  let queryExpenses = supabase.from("expenses").select("*").eq("user_id", user.id);
  if (selectedFarmId) {
    queryExpenses = queryExpenses.eq("farm_id", selectedFarmId);
  }
  const { data: expensesData } = await queryExpenses;
  const expenses: Expense[] = expensesData ?? [];

  // 6. Ambil data Pemberian Pakan (Feeding Logs)
  let feedingLogs: FeedingLog[] = [];
  if (cycleIds.length > 0) {
    const { data: feedingData } = await supabase
      .from("feeding_logs")
      .select("*")
      .in("cycle_id", cycleIds);
    feedingLogs = feedingData ?? [];
  }

  // ── KALKULASI METRIK FINANSIAL ──

  // Total Hasil Panen (kg)
  const totalHarvestKg = harvests.reduce((acc, curr) => acc + Number(curr.weight_kg || 0), 0);

  // Total Biaya dari Expenses (Pakan, Bibit, Obat, Listrik, Peralatan, Gaji, Lainnya)
  const totalExpensesAmount = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  // Total Biaya Pakan dari Feeding Logs
  const totalFeedingLogsCost = feedingLogs.reduce((acc, curr) => acc + Number(curr.total_cost || 0), 0);

  // Total Biaya Operasional Keseluruhan
  const totalOperationalCost = totalExpensesAmount + totalFeedingLogsCost;

  // HPP (Harga Pokok Penjualan) per Kg
  const hppPerKg = totalHarvestKg > 0 ? totalOperationalCost / totalHarvestKg : 0;

  // Estimasi Harga Jual Pasar Ikan (Standar rata-rata Rp 23.000/kg)
  const estimatedMarketPrice = 23000;
  const totalRevenue = totalHarvestKg * estimatedMarketPrice;
  const netProfit = totalRevenue - totalOperationalCost;
  const isProfit = netProfit >= 0;

  // Breakdown Komposisi Biaya per Kategori
  const categoryCosts: Record<string, number> = {
    Pakan: totalFeedingLogsCost,
    Bibit: 0,
    "Obat & Vitamin": 0,
    "Listrik & BBM": 0,
    Peralatan: 0,
    "Gaji Pekerja": 0,
    Lainnya: 0,
  };

  expenses.forEach((exp) => {
    const cat = exp.category || "Lainnya";
    categoryCosts[cat] = (categoryCosts[cat] || 0) + Number(exp.amount || 0);
  });

  const farmMap = new Map<string, string>(farms.map((f) => [f.id, f.name]));
  const pondMap = new Map<string, Pond>(ponds.map((p) => [p.id, p]));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={24} className="text-sky-500" />
            Laporan Finansial & Analisis HPP
          </h1>
          <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
            Analisis modal per kilogram (HPP), estimasi laba rugi, dan efisiensi operasional budidaya
          </p>
        </div>
        <ExportPdfButton />
      </div>

      {/* ── Filter Farm ── */}
      {farms.length > 0 && (
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm">
          <Filter size={14} className="text-sky-500 shrink-0 font-bold" />
          <span className="text-xs font-bold text-gray-700 dark:text-slate-200 shrink-0">Filter Lokasi Gudang/Farm:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <Link
              href="/dashboard/reports"
              className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                !selectedFarmId ? "bg-sky-600 text-white" : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              Semua Farm
            </Link>
            {farms.map((f) => (
              <Link
                key={f.id}
                href={`/dashboard/reports?farm=${f.id}`}
                className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 ${
                  selectedFarmId === f.id ? "bg-sky-600 text-white" : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                }`}
              >
                <MapPin size={11} />
                {f.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Top Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* HPP per Kg Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground dark:text-slate-400">HPP (Modal / Kg)</p>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50">
              <Scale size={20} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {totalHarvestKg > 0 ? formatCurrency(hppPerKg) : "Rp 0"}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
              {totalHarvestKg > 0 ? `Berdasarkan ${totalHarvestKg.toLocaleString("id-ID")} kg panen` : "Belum ada data panen kg"}
            </p>
          </div>
        </div>

        {/* Total Biaya Operasional */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground dark:text-slate-400">Total Biaya Budidaya</p>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/50">
              <TrendingDown size={20} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
              {formatCurrency(totalOperationalCost)}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">Akumulasi pakan & operasional</p>
          </div>
        </div>

        {/* Estimasi Pendapatan */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground dark:text-slate-400">Est. Pendapatan Panen</p>
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/50">
              <DollarSign size={20} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">Asumsi harga Rp 23.000/kg</p>
          </div>
        </div>

        {/* Est. Laba Bersih */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground dark:text-slate-400">Estimasi Laba / Rugi</p>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isProfit ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50" : "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800/50"}`}>
              {isProfit ? <TrendingUp size={20} /> : <AlertCircle size={20} />}
            </div>
          </div>
          <div>
            <p className={`text-2xl font-extrabold ${isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {formatCurrency(netProfit)}
            </p>
            <p className={`text-[11px] font-bold mt-0.5 ${isProfit ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}>
              {isProfit ? "🟢 Est. Untung (Profit)" : "🔴 Est. Rugi (Loss)"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Cost Composition Breakdown ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart size={20} className="text-sky-500" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Komposisi Pengeluaran Operasional Budidaya</h2>
          </div>
          <span className="text-xs text-muted-foreground dark:text-slate-400 font-medium">Total: {formatCurrency(totalOperationalCost)}</span>
        </div>

        {totalOperationalCost === 0 ? (
          <p className="text-sm text-gray-400 dark:text-slate-500 italic text-center py-4">Belum ada catatan biaya atau pengeluaran pakan.</p>
        ) : (
          <div className="space-y-3 pt-2">
            {Object.entries(categoryCosts).map(([catName, cost]) => {
              const pct = totalOperationalCost > 0 ? Math.round((cost / totalOperationalCost) * 100) : 0;
              if (cost === 0) return null;
              return (
                <div key={catName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-gray-700 dark:text-slate-300">{catName}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(cost)} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        catName === "Pakan" ? "bg-amber-500" : catName === "Bibit" ? "bg-blue-500" : "bg-sky-500"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Cycles Performance & HPP Table ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award size={20} className="text-sky-500" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Rincian Efisiensi & HPP Per Siklus Kolam</h2>
          </div>
        </div>

        {cycles.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-slate-500 text-sm">Belum ada siklus budidaya yang tercatat.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-800 text-xs text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Kolam & Komoditas</th>
                  <th className="py-3.5 px-6">Stok Tebar</th>
                  <th className="py-3.5 px-6">Total Panen (Kg)</th>
                  <th className="py-3.5 px-6">Est. HPP / Kg</th>
                  <th className="py-3.5 px-6">Status Siklus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {cycles.map((c) => {
                  const pondObj = pondMap.get(c.pond_id);
                  const cycleHarvests = harvests.filter((h) => h.cycle_id === c.id);
                  const cycleKg = cycleHarvests.reduce((acc, h) => acc + Number(h.weight_kg || 0), 0);
                  const cycleFeedingCost = feedingLogs
                    .filter((fl) => fl.cycle_id === c.id)
                    .reduce((acc, fl) => acc + Number(fl.total_cost || 0), 0);
                  const cycleHpp = cycleKg > 0 ? cycleFeedingCost / cycleKg : 0;

                  return (
                    <tr key={c.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">
                        {pondObj?.name || "Kolam"}
                        <span className="block text-xs font-normal text-muted-foreground dark:text-slate-400">{c.fish_type}</span>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-700 dark:text-slate-300">
                        {c.initial_stock.toLocaleString("id-ID")} <span className="text-xs text-gray-400 dark:text-slate-500">ekor</span>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                        {cycleKg > 0 ? `${cycleKg.toLocaleString("id-ID")} kg` : "-"}
                      </td>
                      <td className="py-4 px-6 font-bold text-amber-600 dark:text-amber-400">
                        {cycleHpp > 0 ? formatCurrency(cycleHpp) : "-"}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-md ${c.status === "active" ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50" : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50"}`}>
                          {c.status === "active" ? "Aktif Budidaya" : "Panen Selesai"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
