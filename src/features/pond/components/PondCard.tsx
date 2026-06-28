"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Fish, Trash2, MoreVertical, Loader2, MapPin, Calendar, Activity } from "lucide-react";
import { deletePond } from "@/features/pond/actions/pond.actions";
import type { Pond, PondCycle } from "@/shared/types/database.types";
import { StartCycleDialog } from "./StartCycleDialog";
import { RecordHarvestDialog } from "./RecordHarvestDialog";
import { FeedPondDialog } from "./FeedPondDialog";

interface PondCardProps {
  pond: Pond;
  farmName?: string;
  activeCycle?: PondCycle | null;
  feedItems?: Array<{
    id: string;
    name: string;
    stock_quantity: number;
    unit: string;
    unit_price: number | null;
  }>;
}

export function PondCard({ pond, farmName, activeCycle, feedItems = [] }: PondCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePond(pond.id);
      if (result?.error) {
        toast.error("Gagal menghapus kolam", { description: result.error });
      } else {
        toast.success("Kolam berhasil dihapus");
        setConfirmDelete(false);
      }
    });
  };

  // Calculate day count of cultivation cycle
  const calculateDays = (startDateStr: string) => {
    const start = new Date(startDateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <>
      <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
        <div>
          {/* Top accent line */}
          <div
            className={`h-1.5 w-full bg-gradient-to-r ${
              activeCycle
                ? "from-emerald-400 to-teal-400"
                : "from-gray-300 dark:from-slate-700 to-slate-300 dark:to-slate-600"
            }`}
          />

          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    activeCycle
                      ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-800/50"
                      : "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                  }`}
                >
                  <Fish
                    size={18}
                    className={activeCycle ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-slate-500"}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{pond.name}</h3>
                  {farmName && (
                    <div className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md mt-1 border border-sky-100 dark:border-sky-800/50">
                      <MapPin size={11} className="text-sky-500 dark:text-sky-400" />
                      <span className="truncate">{farmName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Menu button */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowMenu((v) => !v)}
                  className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
                >
                  <MoreVertical size={16} />
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-8 z-20 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 py-1 min-w-[140px]">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setConfirmDelete(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 size={14} />
                        Hapus Kolam
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {pond.description && (
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-3 line-clamp-1">{pond.description}</p>
            )}

            {/* Active Cycle Box OR Empty Box */}
            {activeCycle ? (
              <div className="bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/50 rounded-xl p-3 space-y-2.5 mb-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                    <Activity size={10} /> Siklus Aktif
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 shadow-xs">
                    <Calendar size={11} className="text-emerald-600 dark:text-emerald-400" /> Hari ke-{calculateDays(activeCycle.start_date)}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-0.5">
                  <div>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">Komoditas</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{activeCycle.fish_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">Stok Saat Ini</p>
                    <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      {activeCycle.current_stock.toLocaleString("id-ID")}{" "}
                      <span className="text-xs font-normal text-gray-400 dark:text-slate-500">/ {activeCycle.initial_stock.toLocaleString("id-ID")}</span>
                    </p>
                  </div>
                </div>

                {/* Estimation & Progress Bar */}
                {(() => {
                  const days = calculateDays(activeCycle.start_date);
                  const targetDays = activeCycle.target_days || 90;
                  const pct = Math.min(100, Math.round((days / targetDays) * 100));
                  return (
                    <div className="pt-1 border-t border-emerald-100/80 dark:border-emerald-900/40 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-medium text-emerald-900 dark:text-emerald-200">
                        <span>Estimasi Masa Pemeliharaan</span>
                        <span>{pct}% ({days}/{targetDays} Hari)</span>
                      </div>
                      <div className="w-full h-1.5 bg-emerald-200/60 dark:bg-emerald-950 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-slate-800/50 border border-dashed border-gray-200 dark:border-slate-800 rounded-xl p-3 text-center mb-2">
                <p className="text-xs font-semibold text-gray-600 dark:text-slate-300">Kolam Kosong</p>
                <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-0.5">Siap untuk memulai tebar benih baru</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="px-5 pb-5 pt-1">
          {activeCycle ? (
            <div className="grid grid-cols-2 gap-2">
              <FeedPondDialog cycle={activeCycle} pondName={pond.name} feedItems={feedItems} />
              <RecordHarvestDialog cycle={activeCycle} pondName={pond.name} />
            </div>
          ) : (
            <StartCycleDialog pondId={pond.id} pondName={pond.name} />
          )}
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isPending && setConfirmDelete(false)}
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/60 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-center font-semibold text-gray-900 dark:text-white text-lg">Hapus Kolam?</h3>
            <p className="text-center text-sm text-muted-foreground dark:text-slate-400 mt-2">
              Kolam <strong className="text-gray-900 dark:text-white">&ldquo;{pond.name}&rdquo;</strong> beserta semua riwayat siklusnya akan dihapus. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <><Loader2 size={15} className="animate-spin" /> Menghapus...</>
                ) : (
                  "Ya, Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
