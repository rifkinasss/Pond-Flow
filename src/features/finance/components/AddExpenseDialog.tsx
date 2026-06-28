"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { Plus, X, Wallet, Loader2, MapPin, Fish, Tag } from "lucide-react";
import { createExpense } from "@/features/finance/actions/expense.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { EXPENSE_CATEGORIES } from "@/features/finance/constants/expense.constants";

interface AddExpenseDialogProps {
  farms: Array<{ id: string; name: string }>;
  ponds: Array<{ id: string; farm_id: string; name: string }>;
  defaultFarmId?: string;
}

export function AddExpenseDialog({ farms, ponds, defaultFarmId }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedFarmId, setSelectedFarmId] = useState(defaultFarmId || farms[0]?.id || "");
  const [selectedCategory, setSelectedCategory] = useState("Pakan");
  const [amountInput, setAmountInput] = useState<string>("");

  // Filter ponds based on selected farm
  const availablePonds = ponds.filter((p) => p.farm_id === selectedFarmId);

  useEffect(() => {
    if (!selectedFarmId && farms.length > 0) {
      setSelectedFarmId(farms[0].id);
    }
  }, [farms, selectedFarmId]);

  const handleClose = () => {
    if (isPending) return;
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("category", selectedCategory);

    startTransition(async () => {
      const result = await createExpense(formData);
      if (result?.error) {
        toast.error("Gagal mencatat pengeluaran", { description: result.error });
      } else {
        toast.success("Pengeluaran berhasil dicatat! 💰");
        setOpen(false);
      }
    });
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={farms.length === 0}
        className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-200 dark:shadow-none rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
      >
        <Plus size={16} />
        Catat Pengeluaran
      </Button>

      {/* Modal Backdrop */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center border border-sky-100 dark:border-sky-800/50">
                  <Wallet size={20} className="text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Catat Pengeluaran Baru</h2>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Masukan detail biaya operasional budidaya</p>
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
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Category selector */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Tag size={14} className="text-sky-500" />
                  Kategori Pengeluaran <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                        selectedCategory === cat.id
                          ? "bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-200 dark:shadow-none scale-[1.02]"
                          : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/60"
                      }`}
                    >
                      <span className="text-sm">{cat.icon}</span>
                      <span className="truncate">{cat.name.split("/")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Farm & Pond selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="farm_id" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                    Lokasi Farm <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <select
                      id="farm_id"
                      name="farm_id"
                      value={selectedFarmId}
                      onChange={(e) => setSelectedFarmId(e.target.value)}
                      required
                      disabled={isPending}
                      className="w-full h-10 px-3 pr-8 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 appearance-none text-gray-800 dark:text-white font-medium"
                    >
                      {farms.map((farm) => (
                        <option key={farm.id} value={farm.id} className="dark:bg-slate-900">
                          {farm.name}
                        </option>
                      ))}
                    </select>
                    <MapPin size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pond_id" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                    Kolam (Opsional)
                  </Label>
                  <div className="relative">
                    <select
                      id="pond_id"
                      name="pond_id"
                      defaultValue="all"
                      disabled={isPending}
                      className="w-full h-10 px-3 pr-8 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 appearance-none text-gray-800 dark:text-white font-medium"
                    >
                      <option value="all" className="dark:bg-slate-900">Semua Kolam / Operasional Umum</option>
                      {availablePonds.map((pond) => (
                        <option key={pond.id} value={pond.id} className="dark:bg-slate-900">
                          {pond.name}
                        </option>
                      ))}
                    </select>
                    <Fish size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Nominal & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="amount_display" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                    Nominal Pengeluaran (Rp) <span className="text-red-500">*</span>
                  </Label>
                  <input type="hidden" name="amount" value={amountInput} />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 dark:text-slate-500">
                      Rp
                    </span>
                    <Input
                      id="amount_display"
                      type="text"
                      placeholder="Cth: 1.500.000"
                      value={amountInput ? parseInt(amountInput.replace(/\D/g, ""), 10).toLocaleString("id-ID") : ""}
                      onChange={(e) => {
                        const rawDigits = e.target.value.replace(/\D/g, "");
                        setAmountInput(rawDigits);
                      }}
                      required
                      disabled={isPending}
                      className="pl-9 rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 font-bold text-gray-900 dark:text-white focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="expense_date" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                    Tanggal Pengeluaran
                  </Label>
                  <Input
                    id="expense_date"
                    name="expense_date"
                    type="date"
                    defaultValue={todayStr}
                    disabled={isPending}
                    className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                  Catatan / Keterangan
                </Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Cth: Pakan Feng Li 3 - 5 karung dari Toko Tani Sidoarjo"
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
                      <Plus size={16} className="mr-2" />
                      Simpan Pengeluaran
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
