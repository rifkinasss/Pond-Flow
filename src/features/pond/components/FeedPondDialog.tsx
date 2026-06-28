"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { Wheat, X, Loader2, Clock, Calculator } from "lucide-react";
import { recordFeeding } from "@/features/pond/actions/feed.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/shared/lib/utils";
import type { PondCycle } from "@/shared/types/database.types";

interface FeedPondDialogProps {
  cycle: PondCycle;
  pondName: string;
  feedItems: Array<{
    id: string;
    name: string;
    stock_quantity: number;
    unit: string;
    unit_price: number | null;
  }>;
}

export function FeedPondDialog({ cycle, pondName, feedItems }: FeedPondDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [selectedItemId, setSelectedItemId] = useState(feedItems[0]?.id || "none");
  const [amountKg, setAmountKg] = useState<string>("0.5");
  const [unitPrice, setUnitPrice] = useState<string>(() => {
    const first = feedItems[0];
    return first && first.unit_price !== null ? String(first.unit_price) : "10000";
  });

  // Format current local date-time for datetime-local input (YYYY-MM-DDTHH:mm)
  const getNowLocalStr = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const [feedTime, setFeedTime] = useState(getNowLocalStr());

  // Update unit price automatically when selected feed item changes
  useEffect(() => {
    const item = feedItems.find((i) => i.id === selectedItemId);
    if (item && item.unit_price !== null) {
      setUnitPrice(String(item.unit_price));
    }
  }, [selectedItemId, feedItems]);

  const selectedItem = feedItems.find((i) => i.id === selectedItemId);
  const calculatedCost = (parseFloat(amountKg) || 0) * (parseFloat(unitPrice) || 0);

  const handleClose = () => {
    if (isPending) return;
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("cycle_id", cycle.id);
    formData.set("inventory_item_id", selectedItemId);
    formData.set("unit_price", unitPrice);

    startTransition(async () => {
      const result = await recordFeeding(formData);
      if (result?.error) {
        toast.error("Gagal mencatat pakan", { description: result.error });
      } else {
        toast.success(`Berhasil memberi pakan ${amountKg} kg ke ${pondName}! 🌾`, {
          description: `Estimasi budget keluar: ${formatCurrency(result.totalCost || calculatedCost)}`,
        });
        setOpen(false);
      }
    });
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-sky-200 dark:shadow-none"
      >
        <Wheat size={14} className="mr-1.5" />
        Beri Pakan
      </Button>

      {/* Modal Backdrop */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center border border-sky-100 dark:border-sky-800/50">
                  <Wheat size={20} className="text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Beri Pakan Harian</h2>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">
                    Kolam: <strong className="text-gray-900 dark:text-white">{pondName}</strong> ({cycle.fish_type})
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Select Feed from Inventory */}
              <div className="space-y-1.5">
                <Label htmlFor="inventory_item_id" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                  Pilih Pakan dari Gudang Inventori
                </Label>
                <select
                  id="inventory_item_id"
                  name="inventory_item_id"
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  disabled={isPending}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 appearance-none text-gray-800 dark:text-white font-medium"
                >
                  <option value="none" className="dark:bg-slate-900">-- Pakan Umum (Tanpa Potong Gudang) --</option>
                  {feedItems.map((item) => (
                    <option key={item.id} value={item.id} className="dark:bg-slate-900">
                      {item.name} (Stok: {item.stock_quantity} {item.unit} {item.unit_price ? `| ${formatCurrency(Number(item.unit_price))}/${item.unit}` : ""})
                    </option>
                  ))}
                </select>
                {selectedItem && (
                  <div className="flex items-center justify-between text-[11px] text-sky-700 dark:text-sky-300 font-medium bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-100 dark:border-sky-800/50">
                    <span>📍 Stok tersisa: <strong>{selectedItem.stock_quantity} {selectedItem.unit}</strong></span>
                    <span>🏷️ Harga: <strong>{selectedItem.unit_price ? formatCurrency(Number(selectedItem.unit_price)) : "Rp 0"} / {selectedItem.unit}</strong></span>
                  </div>
                )}
              </div>

              {/* Feed Date & Time */}
              <div className="space-y-1.5">
                <Label htmlFor="feed_time" className="text-sm font-medium text-gray-700 dark:text-slate-200 flex items-center gap-1">
                  <Clock size={13} className="text-sky-500" />
                  Tanggal & Jam Pemberian Pakan
                </Label>
                <Input
                  id="feed_time"
                  name="feed_time"
                  type="datetime-local"
                  value={feedTime}
                  onChange={(e) => setFeedTime(e.target.value)}
                  required
                  disabled={isPending}
                  className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              {/* Amount kg & Unit Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="amount_kg" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                    Jumlah ({selectedItem?.unit || "Kg"}) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="amount_kg"
                    name="amount_kg"
                    type="number"
                    step="0.1"
                    value={amountKg}
                    onChange={(e) => setAmountKg(e.target.value)}
                    required
                    min={0.1}
                    disabled={isPending}
                    className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 font-bold text-gray-900 dark:text-white focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700 dark:text-slate-200">
                    Harga / {selectedItem?.unit || "Kg"}
                  </Label>
                  <input type="hidden" name="unit_price" value={unitPrice} />
                  <div className="h-10 px-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                    <span>{formatCurrency(Number(unitPrice) || 0)}</span>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 font-normal">/ {selectedItem?.unit || "kg"}</span>
                  </div>
                </div>
              </div>

              {/* Live Estimated Budget Banner */}
              <div className="bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800/50 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-900 dark:text-sky-200">
                  <Calculator size={16} className="text-sky-600 dark:text-sky-400" />
                  <span>Estimasi Budget Keluar:</span>
                </div>
                <span className="text-base font-extrabold text-sky-600 dark:text-sky-400">
                  {formatCurrency(calculatedCost)}
                </span>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                  Catatan Respon Ikan (Opsional)
                </Label>
                <textarea
                  id="notes"
                  name="notes"
                  placeholder="Cth: Pakan pagi jam 08:00, respon makan sangat lahap"
                  rows={2}
                  disabled={isPending}
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white px-3 py-2 text-sm outline-none transition-colors focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:opacity-50 resize-none placeholder:text-muted-foreground dark:placeholder:text-slate-500"
                />
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-200 dark:shadow-none"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Wheat size={16} className="mr-2" />
                      Simpan Pakan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
