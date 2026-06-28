"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, X, Sprout, Loader2 } from "lucide-react";
import { startCycle } from "@/features/pond/actions/cycle.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StartCycleDialogProps {
  pondId: string;
  pondName: string;
}

export function StartCycleDialog({ pondId, pondName }: StartCycleDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    if (isPending) return;
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("pond_id", pondId);

    startTransition(async () => {
      const result = await startCycle(formData);
      if (result?.error) {
        toast.error("Gagal memulai siklus", { description: result.error });
      } else {
        toast.success("Siklus tebar benih berhasil dimulai! 🌱");
        setOpen(false);
      }
    });
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-emerald-200 dark:shadow-none"
      >
        <Sprout size={14} className="mr-1.5" />
        Tebar Benih Baru
      </Button>

      {/* Modal Backdrop */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50">
                  <Sprout size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Mulai Siklus (Tebar Benih)</h2>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Kolam: <strong className="text-gray-900 dark:text-white">{pondName}</strong></p>
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
              <div className="space-y-1.5">
                <Label htmlFor="fish_type" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                  Jenis Komoditas / Ikan <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fish_type"
                  name="fish_type"
                  placeholder="Cth: Ikan Nila Merah, Udang Vaname, Lele"
                  required
                  disabled={isPending}
                  className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="initial_stock" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                  Jumlah Tebar Benih (Ekor) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="initial_stock"
                  name="initial_stock"
                  type="number"
                  placeholder="Cth: 5000"
                  required
                  min={1}
                  disabled={isPending}
                  className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="start_date" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                    Tanggal Tebar
                  </Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    defaultValue={todayStr}
                    disabled={isPending}
                    className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="target_days" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                    Target Pemeliharaan (Hari)
                  </Label>
                  <Input
                    id="target_days"
                    name="target_days"
                    type="number"
                    defaultValue={90}
                    min={10}
                    placeholder="Cth: 90"
                    disabled={isPending}
                    className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
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
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 dark:shadow-none"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Plus size={16} className="mr-2" />
                      Mulai Siklus
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
