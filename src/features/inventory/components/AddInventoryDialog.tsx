"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, X, Package, Loader2, MapPin, Tag, AlertTriangle } from "lucide-react";
import { createInventoryItem } from "@/features/inventory/actions/inventory.actions";
import { INVENTORY_CATEGORIES, INVENTORY_UNITS } from "@/features/inventory/constants/inventory.constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/shared/lib/utils";

interface AddInventoryDialogProps {
  farms: Array<{ id: string; name: string }>;
  defaultFarmId?: string;
}

export function AddInventoryDialog({ farms, defaultFarmId }: AddInventoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedFarmId, setSelectedFarmId] = useState(defaultFarmId || farms[0]?.id || "");
  const [selectedCategory, setSelectedCategory] = useState("Pakan");
  const [unitPriceInput, setUnitPriceInput] = useState<string>("12500");

  const handleClose = () => {
    if (isPending) return;
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("category", selectedCategory);

    startTransition(async () => {
      const result = await createInventoryItem(formData);
      if (result?.error) {
        toast.error("Gagal menambahkan barang", { description: result.error });
      } else {
        toast.success("Barang inventori berhasil ditambahkan! 📦");
        setOpen(false);
      }
    });
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={farms.length === 0}
        className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-200 dark:shadow-none rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
      >
        <Plus size={16} />
        Tambah Barang
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
                  <Package size={20} className="text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Tambah Barang Inventori</h2>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Daftarkan stok pakan, obat, atau peralatan baru</p>
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
                  Kategori Barang <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {INVENTORY_CATEGORIES.map((cat) => (
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
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Farm & Item Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="farm_id" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                    Lokasi Gudang / Farm <span className="text-red-500">*</span>
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
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                    Nama Barang <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Cth: Pakan Feng Li 3A"
                    required
                    minLength={2}
                    disabled={isPending}
                    className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Quantity, Unit, Price & Alert */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="stock_quantity" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                    Stok Awal <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    step="0.1"
                    placeholder="25"
                    defaultValue={10}
                    required
                    min={0}
                    disabled={isPending}
                    className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 font-bold dark:text-white focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="unit" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                    Satuan <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="unit"
                    name="unit"
                    defaultValue="kg"
                    required
                    disabled={isPending}
                    className="w-full h-10 px-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 appearance-none text-gray-800 dark:text-white font-medium"
                  >
                    {INVENTORY_UNITS.map((u) => (
                      <option key={u.id} value={u.id} className="dark:bg-slate-900">
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="unit_price_display" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                    Harga / Satuan (Rp) <span className="text-red-500">*</span>
                  </Label>
                  <input type="hidden" name="unit_price" value={unitPriceInput} />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 dark:text-slate-500">
                      Rp
                    </span>
                    <Input
                      id="unit_price_display"
                      type="text"
                      placeholder="12.500"
                      value={unitPriceInput ? parseInt(unitPriceInput.replace(/\D/g, ""), 10).toLocaleString("id-ID") : ""}
                      onChange={(e) => {
                        const rawDigits = e.target.value.replace(/\D/g, "");
                        setUnitPriceInput(rawDigits);
                      }}
                      required
                      disabled={isPending}
                      className="pl-8 rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 font-bold text-gray-900 dark:text-white focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="min_stock_alert" className="text-sm font-medium text-gray-700 dark:text-slate-200 flex items-center gap-1">
                    <AlertTriangle size={12} className="text-amber-500" />
                    Alert Min. Stok
                  </Label>
                  <Input
                    id="min_stock_alert"
                    name="min_stock_alert"
                    type="number"
                    step="0.1"
                    defaultValue={5}
                    required
                    min={0}
                    disabled={isPending}
                    className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 font-semibold text-amber-700 dark:text-amber-400 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                  Spesifikasi / Catatan
                </Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Cth: Ukuran pelet 1.5-2.0mm, protein 38-40%"
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
                      Simpan Barang
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
