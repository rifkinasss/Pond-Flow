import type { Metadata } from "next";
import { createClient } from "@/shared/lib/supabase/server";
import { MapPin, Fish } from "lucide-react";
import { AddFarmDialog } from "@/features/farm/components/AddFarmDialog";
import { FarmCard } from "@/features/farm/components/FarmCard";
import type { Farm } from "@/shared/types/database.types";

export const metadata: Metadata = { title: "Lokasi / Farm" };

export default async function FarmsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Ambil semua farm milik user
  const { data: farms } = (await supabase
    .from("farms")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })) as { data: Farm[] | null };

  // Ambil jumlah kolam per farm sekaligus
  const { data: pondCounts } = await supabase
    .from("ponds")
    .select("farm_id")
    .in("farm_id", (farms ?? []).map((f) => f.id));

  const pondCountMap = (pondCounts ?? []).reduce<Record<string, number>>(
    (acc, p) => {
      acc[p.farm_id] = (acc[p.farm_id] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const farmList = farms ?? [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin size={24} className="text-sky-500" />
            Lokasi / Farm
          </h1>
          <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
            Kelola semua lokasi tambak dan farm budidaya Anda
          </p>
        </div>
        <AddFarmDialog />
      </div>

      {/* ── Stats bar ── */}
      <div className="flex items-center gap-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center border border-sky-100 dark:border-sky-800/50">
            <MapPin size={18} className="text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{farmList.length}</p>
            <p className="text-xs text-muted-foreground dark:text-slate-400">Total Farm</p>
          </div>
        </div>
        <div className="w-px h-10 bg-gray-100 dark:bg-slate-800" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center border border-violet-100 dark:border-violet-800/50">
            <Fish size={18} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Object.values(pondCountMap).reduce((a, b) => a + b, 0)}
            </p>
            <p className="text-xs text-muted-foreground dark:text-slate-400">Total Kolam</p>
          </div>
        </div>
      </div>

      {/* ── Farm list ── */}
      {farmList.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 text-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center mb-4">
            <MapPin size={28} className="text-sky-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Belum ada farm</h3>
          <p className="text-sm text-muted-foreground dark:text-slate-400 mt-2 max-w-xs">
            Mulai kelola bisnis budidaya Anda dengan menambahkan lokasi farm atau tambak pertama.
          </p>
          <div className="mt-6">
            <AddFarmDialog />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {farmList.map((farm) => (
            <FarmCard
              key={farm.id}
              farm={farm}
              pondCount={pondCountMap[farm.id] ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
