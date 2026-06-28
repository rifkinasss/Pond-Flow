import type { Metadata } from "next";
import { createClient } from "@/shared/lib/supabase/server";
import { Fish, MapPin, Filter, Activity } from "lucide-react";
import { AddPondDialog } from "@/features/pond/components/AddPondDialog";
import { PondCard } from "@/features/pond/components/PondCard";
import Link from "next/link";
import type { Pond, Farm, PondCycle } from "@/shared/types/database.types";

export const metadata: Metadata = { title: "Manajemen Kolam" };

interface PageProps {
  searchParams: Promise<{ farm?: string }>;
}

export default async function PondsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedFarmId = params.farm;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Ambil semua farm milik user
  const { data: farmsData } = await supabase
    .from("farms")
    .select("*")
    .eq("user_id", user!.id)
    .order("name", { ascending: true });

  const farms: Farm[] = farmsData ?? [];
  const farmIds = farms.map((f) => f.id);

  // Ambil semua kolam milik farm user
  let query = supabase
    .from("ponds")
    .select("*")
    .order("created_at", { ascending: false });

  if (farmIds.length > 0) {
    query = query.in("farm_id", farmIds);
  } else {
    query = query.eq("farm_id", "00000000-0000-0000-0000-000000000000");
  }

  if (selectedFarmId) {
    query = query.eq("farm_id", selectedFarmId);
  }

  const { data: pondsData } = await query;
  const ponds: Pond[] = pondsData ?? [];
  const pondIds = ponds.map((p) => p.id);

  // Ambil semua siklus aktif untuk kolam-kolam ini
  let activeCyclesMap = new Map<string, PondCycle>();
  if (pondIds.length > 0) {
    const { data: cyclesData } = await supabase
      .from("pond_cycles")
      .select("*")
      .in("pond_id", pondIds)
      .eq("status", "active");

    if (cyclesData) {
      cyclesData.forEach((c) => activeCyclesMap.set(c.pond_id, c as PondCycle));
    }
  }

  // Ambil barang inventori kategori Pakan
  let feedItems: Array<{ id: string; name: string; stock_quantity: number; unit: string; unit_price: number | null }> = [];
  if (farmIds.length > 0) {
    const { data: inventoryData } = await supabase
      .from("inventory_items")
      .select("id, name, stock_quantity, unit, unit_price")
      .in("farm_id", farmIds)
      .eq("category", "Pakan")
      .order("name", { ascending: true });
    feedItems = (inventoryData ?? []).map((i) => ({
      id: i.id,
      name: i.name,
      stock_quantity: Number(i.stock_quantity),
      unit: i.unit,
      unit_price: i.unit_price ? Number(i.unit_price) : null,
    }));
  }

  // Map farm_id to farm_name for quick lookup
  const farmMap = new Map<string, string>(farms.map((f) => [f.id, f.name]));

  // Count active vs empty ponds
  const activePondsCount = Array.from(activeCyclesMap.keys()).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Fish size={24} className="text-violet-500" />
            Manajemen Kolam
          </h1>
          <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
            Kelola stok ikan, tebar benih, dan pencatatan panen otomatis di setiap kolam
          </p>
        </div>
        <AddPondDialog farms={farms.map((f) => ({ id: f.id, name: f.name }))} defaultFarmId={selectedFarmId} />
      </div>

      {/* ── Stats bar & Filter ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-4 sm:px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center shrink-0 border border-violet-100 dark:border-violet-800/50">
              <Fish size={18} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{ponds.length}</p>
              <p className="text-xs text-muted-foreground dark:text-slate-400">
                {selectedFarmId ? "Kolam di Farm ini" : "Total Kolam"}
              </p>
            </div>
          </div>

          <div className="w-px h-10 bg-gray-100 dark:bg-slate-800" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/50">
              <Activity size={18} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activePondsCount}</p>
              <p className="text-xs text-muted-foreground dark:text-slate-400">Siklus Aktif</p>
            </div>
          </div>

          <div className="w-px h-10 bg-gray-100 dark:bg-slate-800 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center shrink-0 border border-sky-100 dark:border-sky-800/50">
              <MapPin size={18} className="text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{farms.length}</p>
              <p className="text-xs text-muted-foreground dark:text-slate-400">Total Farm</p>
            </div>
          </div>
        </div>

        {/* Farm Filter Pills */}
        {farms.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 mr-1 shrink-0 font-medium">
              <Filter size={13} />
              Filter:
            </div>
            <Link
              href="/dashboard/ponds"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                !selectedFarmId
                  ? "bg-sky-600 text-white shadow-sm shadow-sky-200 dark:shadow-none"
                  : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              Semua Farm
            </Link>
            {farms.map((farm) => (
              <Link
                key={farm.id}
                href={`/dashboard/ponds?farm=${farm.id}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors max-w-[150px] truncate ${
                  selectedFarmId === farm.id
                    ? "bg-sky-600 text-white shadow-sm shadow-sky-200 dark:shadow-none"
                    : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
              >
                {farm.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Pond list ── */}
      {farms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center mb-4">
            <MapPin size={28} className="text-sky-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Belum ada lokasi farm</h3>
          <p className="text-sm text-muted-foreground dark:text-slate-400 mt-2 max-w-xs">
            Sebelum membuat kolam, Anda perlu menambahkan lokasi farm terlebih dahulu.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/farms"
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-sky-200 dark:shadow-none transition-all hover:shadow-lg"
            >
              <MapPin size={16} />
              Buat Farm Pertama
            </Link>
          </div>
        </div>
      ) : ponds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center mb-4">
            <Fish size={28} className="text-violet-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            {selectedFarmId ? "Belum ada kolam di farm ini" : "Belum ada kolam terdaftar"}
          </h3>
          <p className="text-sm text-muted-foreground dark:text-slate-400 mt-2 max-w-xs">
            Mulai daftarkan kolam budidaya pertama Anda untuk mencatat siklus dan tebar benih.
          </p>
          <div className="mt-6">
            <AddPondDialog farms={farms.map((f) => ({ id: f.id, name: f.name }))} defaultFarmId={selectedFarmId} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {ponds.map((pond) => (
            <PondCard
              key={pond.id}
              pond={pond}
              farmName={farmMap.get(pond.farm_id)}
              activeCycle={activeCyclesMap.get(pond.id) || null}
              feedItems={feedItems}
            />
          ))}
        </div>
      )}
    </div>
  );
}
