"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ShoppingBag, X, Loader2, Scale } from "lucide-react";
import { recordHarvest } from "@/features/pond/actions/cycle.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PondCycle } from "@/shared/types/database.types";

interface RecordHarvestDialogProps {
  cycle: PondCycle;
  pondName: string;
}

export function RecordHarvestDialog({ cycle, pondName }: RecordHarvestDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [harvestType, setHarvestType] = useState<"partial" | "final">("partial");

  const handleClose = () => {
    if (isPending) return;
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("cycle_id", cycle.id);
    formData.set("harvest_type", harvestType);

    startTransition(async () => {
      const result = await recordHarvest(formData);
      if (result?.error) {
        toast.error("Gagal mencatat panen", { description: result.error });
      } else {
        toast.success("Catatan panen berhasil disimpan & stok otomatis berkurang! 🎉");
        setOpen(false);
      }
    });
  };

  const calculateDays = (startDateStr: string) => {
    const start = new Date(startDateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  const currentDay = calculateDays(cycle.start_date);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-amber-200 dark:shadow-none"
      >
        <ShoppingBag size={14} className="mr-1.5" />
        Catat Panen
      </Button>

      {/* Modal Backdrop */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center border border-amber-100 dark:border-amber-800/50">
                  <ShoppingBag size={20} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Catat Panen</h2>
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

            {/* Current Stock Banner & Day Count */}
            <div className="bg-amber-50/60 dark:bg-amber-950/40 px-6 py-3 border-b border-amber-100 dark:border-amber-900/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-medium text-amber-900 dark:text-amber-200">
                <span className="bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-md font-bold text-[11px]">
                  Hari ke-{currentDay}
                </span>
                <span>sejak tebar benih</span>
              </div>
              <span className="font-bold text-amber-700 dark:text-amber-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800 shadow-xs">
                {cycle.current_stock.toLocaleString("id-ID")} ekor Sisa
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Harvest Type Switch */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700 dark:text-slate-200">Tipe Panen</Label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setHarvestType("partial")}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                      harvestType === "partial"
                        ? "bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs"
                        : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
                    }`}
                  >
                    Panen Parsial (Sebagian)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHarvestType("final")}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                      harvestType === "final"
                        ? "bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs"
                        : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
                    }`}
                  >
                    Panen Total (Habis)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="amount_harvested" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                    Jumlah Dipanen (Ekor) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="amount_harvested"
                    name="amount_harvested"
                    type="number"
                    placeholder="Cth: 1000"
                    required
                    min={1}
                    max={cycle.current_stock}
                    disabled={isPending}
                    className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="weight_kg" className="text-sm font-medium text-gray-700 dark:text-slate-200 flex items-center gap-1">
                    <Scale size={13} className="text-gray-400 dark:text-slate-500" />
                    Berat Total (Kg)
                  </Label>
                  <Input
                    id="weight_kg"
                    name="weight_kg"
                    type="number"
                    step="0.1"
                    placeholder="Cth: 250.5"
                    disabled={isPending}
                    className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                  Catatan Panen
                </Label>
                <textarea
                  id="notes"
                  name="notes"
                  placeholder="Catatan ukuran sampling, harga jual per kg, pembeli..."
                  rows={2}
                  disabled={isPending}
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white px-3 py-2 text-sm outline-none transition-colors focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 resize-none placeholder:text-muted-foreground dark:placeholder:text-slate-500"
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
                  className="flex-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-200 dark:shadow-none"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} className="mr-2" />
                      Simpan Panen
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
