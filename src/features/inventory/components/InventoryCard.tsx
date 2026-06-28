"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, MoreVertical, Loader2, MapPin, AlertTriangle, Plus, Minus, CheckCircle2, XCircle } from "lucide-react";
import { updateStock, deleteInventoryItem } from "@/features/inventory/actions/inventory.actions";
import { formatCurrency } from "@/shared/lib/utils";
import type { InventoryItem } from "@/shared/types/database.types";
import { INVENTORY_CATEGORIES } from "@/features/inventory/constants/inventory.constants";

interface InventoryCardProps {
  item: InventoryItem;
  farmName?: string;
}

export function InventoryCard({ item, farmName }: InventoryCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [adjusting, setAdjusting] = useState<"add" | "sub" | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>("1");

  const categoryObj = INVENTORY_CATEGORIES.find((c) => c.id === item.category) || {
    id: item.category,
    name: item.category,
    icon: "📦",
    color: "bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700",
  };

  // Determine Stock Status
  const stock = Number(item.stock_quantity);
  const minAlert = Number(item.min_stock_alert);

  let statusBadge = (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
      <CheckCircle2 size={11} /> Stok Aman
    </span>
  );

  if (stock === 0) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50">
        <XCircle size={11} /> Stok Habis
      </span>
    );
  } else if (stock <= minAlert) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 animate-pulse">
        <AlertTriangle size={11} /> Stok Menipis
      </span>
    );
  }

  const handleStockUpdate = (type: "add" | "sub") => {
    const qty = parseFloat(adjustAmount);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Jumlah harus berupa angka positif");
      return;
    }

    const delta = type === "add" ? qty : -qty;

    startTransition(async () => {
      const result = await updateStock(item.id, delta);
      if (result?.error) {
        toast.error("Gagal mengubah stok", { description: result.error });
      } else {
        toast.success(`Stok ${item.name} berhasil ${type === "add" ? "ditambahkan" : "dikurangi"}!`);
        setAdjusting(null);
        setAdjustAmount("1");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteInventoryItem(item.id);
      if (result?.error) {
        toast.error("Gagal menghapus barang", { description: result.error });
      } else {
        toast.success("Barang inventori berhasil dihapus");
        setConfirmDelete(false);
      }
    });
  };

  return (
    <>
      <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
        {/* Top Accent Line */}
        <div
          className={`h-1.5 w-full ${
            stock === 0
              ? "bg-red-500"
              : stock <= minAlert
              ? "bg-amber-400"
              : "bg-sky-500"
          }`}
        />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center shrink-0 text-xl shadow-xs border border-sky-100/50 dark:border-sky-800/50">
                {categoryObj.icon}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {statusBadge}
                  {farmName && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-gray-100 dark:border-slate-700 truncate max-w-[120px]">
                      <MapPin size={10} className="text-sky-500 shrink-0" />
                      <span className="truncate">{farmName}</span>
                    </span>
                  )}
                </div>
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
                      Hapus Barang
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          {item.description ? (
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4 line-clamp-2">{item.description}</p>
          ) : (
            <p className="text-xs text-gray-400 dark:text-slate-500 italic mb-4">Tidak ada spesifikasi tambahan</p>
          )}

          {/* Stock & Price Display Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[11px] text-gray-400 dark:text-slate-400 font-medium">Stok Saat Ini</p>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  {stock.toLocaleString("id-ID")}{" "}
                  <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase">{item.unit}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 dark:text-slate-500">Batas Min. Alert</p>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">{minAlert} {item.unit}</p>
              </div>
            </div>
            {item.unit_price !== null && Number(item.unit_price) > 0 && (
              <div className="pt-2 border-t border-gray-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-slate-400 font-medium">Harga per {item.unit}:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(Number(item.unit_price))}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="px-5 pb-5 pt-1">
          {adjusting ? (
            <div className="bg-gray-50 dark:bg-slate-800 p-2 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-slate-200">
                <span>{adjusting === "add" ? " Restok (Tambah)" : " Pakai (Kurangi)"}</span>
                <button onClick={() => setAdjusting(null)} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
                  <XCircle size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  disabled={isPending}
                  className="w-full h-8 px-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <span className="text-xs font-medium text-gray-500 dark:text-slate-400 shrink-0">{item.unit}</span>
                <button
                  onClick={() => handleStockUpdate(adjusting)}
                  disabled={isPending}
                  className={`h-8 px-3 rounded-lg text-xs font-bold text-white shrink-0 transition-all flex items-center justify-center ${
                    adjusting === "add" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {isPending ? <Loader2 size={13} className="animate-spin" /> : "Simpan"}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setAdjusting("add");
                  setAdjustAmount("1");
                }}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 border border-emerald-200/60 dark:border-emerald-800/50 text-xs font-bold text-emerald-700 dark:text-emerald-300 transition-colors"
              >
                <Plus size={14} /> Restok
              </button>
              <button
                onClick={() => {
                  setAdjusting("sub");
                  setAdjustAmount("1");
                }}
                disabled={stock === 0}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 border border-rose-200/60 dark:border-rose-800/50 text-xs font-bold text-rose-700 dark:text-rose-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus size={14} /> Pakai
              </button>
            </div>
          )}
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
            <h3 className="text-center font-semibold text-gray-900 dark:text-white text-lg">Hapus Barang Inventori?</h3>
            <p className="text-center text-sm text-muted-foreground dark:text-slate-400 mt-2">
              Barang <strong className="text-gray-900 dark:text-white">&ldquo;{item.name}&rdquo;</strong> akan dihapus permanen dari gudang inventori.
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
