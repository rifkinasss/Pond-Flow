import type { Metadata } from "next";
import { createClient } from "@/shared/lib/supabase/server";
import { Package, Filter, AlertTriangle, CheckCircle2, MapPin, XCircle } from "lucide-react";
import { AddInventoryDialog } from "@/features/inventory/components/AddInventoryDialog";
import { InventoryCard } from "@/features/inventory/components/InventoryCard";
import { INVENTORY_CATEGORIES } from "@/features/inventory/constants/inventory.constants";
import Link from "next/link";
import type { InventoryItem } from "@/shared/types/database.types";

export const metadata: Metadata = { title: "Inventori Stok & Saprokan" };

interface PageProps {
  searchParams: Promise<{ farm?: string; category?: string }>;
}

export default async function InventoryPage({ searchParams }: PageProps) {
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

  // Ambil inventory items
  let query = supabase
    .from("inventory_items")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  if (selectedFarmId) {
    query = query.eq("farm_id", selectedFarmId);
  }

  if (selectedCategory) {
    query = query.eq("category", selectedCategory);
  }

  const { data: itemsData } = await query;
  const items: InventoryItem[] = itemsData ?? [];

  // Count stats
  const totalTypes = items.length;
  const lowStockCount = items.filter(
    (i) => Number(i.stock_quantity) > 0 && Number(i.stock_quantity) <= Number(i.min_stock_alert)
  ).length;
  const outOfStockCount = items.filter((i) => Number(i.stock_quantity) === 0).length;

  // Farm Map lookup
  const farmMap = new Map<string, string>(farms.map((f) => [f.id, f.name]));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package size={24} className="text-sky-500" />
            Inventori Stok & Saprokan
          </h1>
          <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
            Kelola stok pakan, obat-obatan, dan peralatan tambak secara real-time
          </p>
        </div>
        <AddInventoryDialog farms={farms} defaultFarmId={selectedFarmId} />
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground dark:text-slate-400">Total Jenis Barang</p>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              {totalTypes} <span className="text-xs font-normal text-gray-400 dark:text-slate-500">item</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center shrink-0 border border-sky-100 dark:border-sky-800/50">
            <CheckCircle2 size={22} className="text-sky-600 dark:text-sky-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground dark:text-slate-400">Stok Menipis (Peringatan)</p>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {lowStockCount} <span className="text-xs font-normal text-gray-400 dark:text-slate-500">item</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-800/50">
            <AlertTriangle size={22} className="text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground dark:text-slate-400">Stok Habis</p>
            <p className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">
              {outOfStockCount} <span className="text-xs font-normal text-gray-400 dark:text-slate-500">item</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 flex items-center justify-center shrink-0 border border-red-100 dark:border-red-800/50">
            <XCircle size={22} className="text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-200">
            <Filter size={14} className="text-sky-500" />
            Filter Gudang & Barang:
          </div>

          {/* Farm Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <Link
              href={`/dashboard/inventory${selectedCategory ? `?category=${selectedCategory}` : ""}`}
              className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                !selectedFarmId
                  ? "bg-sky-600 text-white"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              Semua Gudang/Farm
            </Link>
            {farms.map((f) => (
              <Link
                key={f.id}
                href={`/dashboard/inventory?farm=${f.id}${selectedCategory ? `&category=${selectedCategory}` : ""}`}
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
            href={`/dashboard/inventory${selectedFarmId ? `?farm=${selectedFarmId}` : ""}`}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
              !selectedCategory
                ? "bg-sky-600 text-white shadow-sm shadow-sky-200 dark:shadow-none"
                : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-800"
            }`}
          >
            Semua Kategori
          </Link>
          {INVENTORY_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/dashboard/inventory?category=${cat.id}${selectedFarmId ? `&farm=${selectedFarmId}` : ""}`}
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

      {/* ── Inventory Grid ── */}
      {farms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center mb-4">
            <Package size={28} className="text-sky-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Belum ada lokasi farm</h3>
          <p className="text-sm text-muted-foreground dark:text-slate-400 mt-2 max-w-xs">
            Tambahkan lokasi farm terlebih dahulu sebelum mencatat barang inventori.
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center mb-4 text-2xl">
            📦
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Belum ada barang inventori</h3>
          <p className="text-sm text-muted-foreground dark:text-slate-400 mt-2 max-w-xs">
            {selectedCategory || selectedFarmId
              ? "Tidak ada barang inventori yang sesuai dengan filter ini."
              : "Mulai daftarkan stok pakan, obat-obatan, dan peralatan tambak Anda."}
          </p>
          <div className="mt-6">
            <AddInventoryDialog farms={farms} defaultFarmId={selectedFarmId} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              farmName={farmMap.get(item.farm_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
