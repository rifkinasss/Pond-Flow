"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MapPin, Trash2, Fish, ChevronRight, MoreVertical, Loader2 } from "lucide-react";
import { deleteFarm } from "@/features/farm/actions/farm.actions";
import type { Farm } from "@/shared/types/database.types";
import Link from "next/link";

interface FarmCardProps {
  farm: Farm;
  pondCount?: number;
}

export function FarmCard({ farm, pondCount = 0 }: FarmCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteFarm(farm.id);
      if (result?.error) {
        toast.error("Gagal menghapus farm", { description: result.error });
      } else {
        toast.success("Farm berhasil dihapus");
        setConfirmDelete(false);
      }
    });
  };

  return (
    <>
      <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Top accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 to-cyan-400" />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center shrink-0 border border-sky-100 dark:border-sky-800/50">
                <MapPin size={18} className="text-sky-600 dark:text-sky-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{farm.name}</h3>
                {farm.address && (
                  <p className="text-xs text-muted-foreground dark:text-slate-400 truncate mt-0.5">
                    📍 {farm.address}
                  </p>
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
                      Hapus Farm
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          {farm.description && (
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-4 line-clamp-2">{farm.description}</p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 py-3 border-t border-gray-50 dark:border-slate-800/60">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground dark:text-slate-400">
              <Fish size={13} className="text-sky-500" />
              <span>
                <span className="font-semibold text-gray-700 dark:text-slate-200">{pondCount}</span> kolam
              </span>
            </div>
            <div className="text-xs text-muted-foreground dark:text-slate-400">
              Dibuat{" "}
              {new Date(farm.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>

          {/* CTA */}
          <Link
            href={`/dashboard/ponds?farm=${farm.id}`}
            className="mt-2 flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-gray-50 dark:bg-slate-800/80 hover:bg-sky-50 dark:hover:bg-sky-950/60 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-400 transition-colors border border-gray-100 dark:border-slate-800 hover:border-sky-100 dark:hover:border-sky-800/50"
          >
            Lihat Kolam
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isPending && setConfirmDelete(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/60 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-center font-semibold text-gray-900 dark:text-white text-lg">Hapus Farm?</h3>
            <p className="text-center text-sm text-muted-foreground dark:text-slate-400 mt-2">
              Semua data kolam dan catatan terkait farm{" "}
              <strong className="text-gray-900 dark:text-white">&ldquo;{farm.name}&rdquo;</strong> akan ikut terhapus. Tindakan ini tidak bisa dibatalkan.
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
