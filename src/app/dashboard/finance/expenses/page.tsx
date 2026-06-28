import type { Metadata } from "next";
import { createClient } from "@/shared/lib/supabase/server";
import { Wallet, Filter, TrendingDown, Layers, MapPin } from "lucide-react";
import { AddExpenseDialog } from "@/features/finance/components/AddExpenseDialog";
import { EXPENSE_CATEGORIES } from "@/features/finance/constants/expense.constants";
import { ExpenseCard } from "@/features/finance/components/ExpenseCard";
import { formatCurrency } from "@/shared/lib/utils";
import Link from "next/link";
import type { Expense, Farm, Pond } from "@/shared/types/database.types";

export const metadata: Metadata = { title: "Pengeluaran Operasional" };

interface PageProps {
  searchParams: Promise<{ farm?: string; category?: string }>;
}

export default async function ExpensesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedFarmId = params.farm;
  const selectedCategory = params.category;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Ambil semua farm milik user
  const { data: farmsData } = await supabase
    .from("farms")
    .select("id, name")
    .eq("user_id", user!.id)
    .order("name", { ascending: true });

  const farms: Array<{ id: string; name: string }> = farmsData ?? [];
  const farmIds = farms.map((f) => f.id);

  // Ambil semua kolam milik farm user
  let ponds: Array<{ id: string; farm_id: string; name: string }> = [];
  if (farmIds.length > 0) {
    const { data: pondsData } = await supabase
      .from("ponds")
      .select("id, farm_id, name")
      .in("farm_id", farmIds);
    ponds = pondsData ?? [];
  }

  // Ambil pengeluaran
  let query = supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user!.id)
    .order("expense_date", { ascending: false });

  if (selectedFarmId) {
    query = query.eq("farm_id", selectedFarmId);
  }

  if (selectedCategory) {
    query = query.eq("category", selectedCategory);
  }

  const { data: expensesData } = await query;
  const expenses: Expense[] = expensesData ?? [];

  // Hitung total statistik
  const totalAmount = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const feedExpenses = expenses
    .filter((e) => e.category === "Pakan")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  // Maps for lookup
  const farmMap = new Map<string, string>(farms.map((f) => [f.id, f.name]));
  const pondMap = new Map<string, string>(ponds.map((p) => [p.id, p.name]));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wallet size={24} className="text-sky-500" />
            Pengeluaran Operasional
          </h1>
          <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
            Catat dan pantau seluruh biaya pakan, bibit, peralatan, dan operasional tambak Anda
          </p>
        </div>
        <AddExpenseDialog farms={farms} ponds={ponds} defaultFarmId={selectedFarmId} />
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground dark:text-slate-400">Total Pengeluaran Filtered</p>
            <p className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 mt-1">
              {formatCurrency(totalAmount)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center shrink-0 border border-sky-100 dark:border-sky-800/50">
            <TrendingDown size={22} className="text-sky-600 dark:text-sky-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground dark:text-slate-400">Biaya Pakan Ikan</p>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {formatCurrency(feedExpenses)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center shrink-0 text-xl border border-amber-100 dark:border-amber-800/50">
            🌾
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground dark:text-slate-400">Total Catatan Transaksi</p>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              {expenses.length} <span className="text-xs font-normal text-gray-400 dark:text-slate-500">transaksi</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center shrink-0 border border-sky-100 dark:border-sky-800/50">
            <Layers size={22} className="text-sky-600 dark:text-sky-400" />
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-200">
            <Filter size={14} className="text-sky-500" />
            Filter Pengeluaran:
          </div>

          {/* Farm Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <Link
              href={`/dashboard/finance/expenses${selectedCategory ? `?category=${selectedCategory}` : ""}`}
              className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                !selectedFarmId
                  ? "bg-sky-600 text-white"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              Semua Farm
            </Link>
            {farms.map((f) => (
              <Link
                key={f.id}
                href={`/dashboard/finance/expenses?farm=${f.id}${selectedCategory ? `&category=${selectedCategory}` : ""}`}
                className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 ${
                  selectedFarmId === f.id
                    ? "bg-sky-600 text-white"
                    : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                }`}
              >
                <MapPin size={11} />
                {f.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="h-px bg-gray-100 dark:bg-slate-800 w-full" />

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          <Link
            href={`/dashboard/finance/expenses${selectedFarmId ? `?farm=${selectedFarmId}` : ""}`}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
              !selectedCategory
                ? "bg-sky-600 text-white shadow-sm shadow-sky-200 dark:shadow-none"
                : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-800"
            }`}
          >
            Semua Kategori
          </Link>
          {EXPENSE_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/dashboard/finance/expenses?category=${cat.id}${selectedFarmId ? `&farm=${selectedFarmId}` : ""}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 border ${
                selectedCategory === cat.id
                  ? "bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-200 dark:shadow-none"
                  : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border-gray-100 dark:border-slate-800"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.id}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Expenses List ── */}
      {farms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center mb-4">
            <Wallet size={28} className="text-sky-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Belum ada lokasi farm</h3>
          <p className="text-sm text-muted-foreground dark:text-slate-400 mt-2 max-w-xs">
            Tambahkan lokasi farm terlebih dahulu sebelum mencatat pengeluaran.
          </p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center mb-4 text-2xl">
            💸
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Belum ada catatan pengeluaran</h3>
          <p className="text-sm text-muted-foreground dark:text-slate-400 mt-2 max-w-xs">
            {selectedCategory || selectedFarmId
              ? "Tidak ada catatan pengeluaran yang sesuai dengan filter ini."
              : "Mulai catat pengeluaran operasional pakan, bibit, dan peralatan Anda."}
          </p>
          <div className="mt-6">
            <AddExpenseDialog farms={farms} ponds={ponds} defaultFarmId={selectedFarmId} />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              farmName={farmMap.get(expense.farm_id)}
              pondName={expense.pond_id ? pondMap.get(expense.pond_id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
