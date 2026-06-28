"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, X, Fish, Loader2, MapPin } from "lucide-react";
import { createPond } from "@/features/pond/actions/pond.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddPondDialogProps {
  farms: Array<{ id: string; name: string }>;
  defaultFarmId?: string;
}

export function AddPondDialog({ farms, defaultFarmId }: AddPondDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedFarmId, setSelectedFarmId] = useState(defaultFarmId || farms[0]?.id || "");

  const handleClose = () => {
    if (isPending) return;
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createPond(formData);
      if (result?.error) {
        toast.error("Gagal menambahkan kolam", { description: result.error });
      } else {
        toast.success("Kolam berhasil ditambahkan! 🐟");
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
        Tambah Kolam
      </Button>

      {/* Modal Backdrop */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Dialog */}
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center border border-violet-100 dark:border-violet-800/50">
                  <Fish size={20} className="text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Tambah Kolam Baru</h2>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Daftarkan kolam budidaya Anda</p>
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
              {/* Select Farm */}
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

              {/* Pond Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                  Nama Kolam <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Cth: Kolam A1 - Lele"
                  required
                  minLength={2}
                  disabled={isPending}
                  className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              {/* Pond Type */}
              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                  Tipe Kolam <span className="text-red-500">*</span>
                </Label>
                <select
                  id="type"
                  name="type"
                  defaultValue="terpal"
                  required
                  disabled={isPending}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 appearance-none text-gray-800 dark:text-white font-medium"
                >
                  <option value="terpal" className="dark:bg-slate-900">Kolam Terpal</option>
                  <option value="tanah" className="dark:bg-slate-900">Kolam Tanah</option>
                  <option value="beton" className="dark:bg-slate-900">Kolam Beton</option>
                  <option value="ember" className="dark:bg-slate-900">Ember / Budikdamber</option>
                  <option value="bioflok" className="dark:bg-slate-900">Bioflok</option>
                  <option value="lainnya" className="dark:bg-slate-900">Lainnya</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                  Deskripsi / Catatan
                </Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Informasi tipe kolam, ukuran, jenis komoditas..."
                  rows={3}
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
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Plus size={16} className="mr-2" />
                      Simpan Kolam
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
