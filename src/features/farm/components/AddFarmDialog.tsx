"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { Plus, X, MapPin, Loader2, LocateFixed } from "lucide-react";
import { createFarm } from "@/features/farm/actions/farm.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddFarmDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLocating, setIsLocating] = useState(false);
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const addressRef = useRef<HTMLInputElement>(null);

  // ── Reset state when dialog closes ──────────────────────────────────────
  const handleClose = () => {
    if (isPending || isLocating) return;
    setOpen(false);
    setAddress("");
    setCoords(null);
  };

  // ── Reverse geocode via OpenStreetMap Nominatim (free, no API key) ───────
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast.error("GPS tidak tersedia", {
        description: "Browser Anda tidak mendukung fitur geolokasi.",
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=id`,
            { headers: { "Accept-Language": "id" } }
          );
          if (!res.ok) throw new Error("Gagal mendapatkan alamat");
          const data = await res.json();

          // Build a clean address string from the response
          const a = data.address ?? {};
          const parts = [
            a.road,
            a.village ?? a.suburb,
            a.city_district ?? a.town ?? a.city,
            a.state,
          ].filter(Boolean);

          const resolved = parts.length > 0 ? parts.join(", ") : data.display_name;
          setAddress(resolved);
          setCoords({ lat: latitude, lon: longitude });
          toast.success("Lokasi berhasil dideteksi 📍");
        } catch {
          toast.error("Gagal mendapatkan alamat", {
            description: "Coba lagi atau isi alamat secara manual.",
          });
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        const messages: Record<number, string> = {
          1: "Akses lokasi ditolak. Izinkan akses lokasi di pengaturan browser.",
          2: "Posisi tidak tersedia. Pastikan GPS aktif.",
          3: "Waktu habis. Coba lagi.",
        };
        toast.error("Tidak dapat mengakses GPS", {
          description: messages[err.code] ?? "Terjadi kesalahan.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── Form submit ──────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Attach GPS coordinates if available
    if (coords) {
      formData.set("latitude", String(coords.lat));
      formData.set("longitude", String(coords.lon));
    }

    startTransition(async () => {
      const result = await createFarm(formData);
      if (result?.error) {
        toast.error("Gagal menambahkan farm", { description: result.error });
      } else {
        toast.success("Farm berhasil ditambahkan! 🎉");
        setOpen(false);
        setAddress("");
        setCoords(null);
      }
    });
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-200 dark:shadow-none rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5"
      >
        <Plus size={16} />
        Tambah Farm
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
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center border border-sky-100 dark:border-sky-800/50">
                  <MapPin size={20} className="text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Tambah Lokasi Farm</h2>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Isi detail lokasi tambak Anda</p>
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
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                  Nama Farm <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Cth: Tambak Udang Sidoarjo"
                  required
                  minLength={2}
                  disabled={isPending}
                  className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              {/* Address field + GPS button */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                    Alamat / Lokasi
                  </Label>
                  <button
                    type="button"
                    onClick={handleUseLocation}
                    disabled={isLocating || isPending}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLocating ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Mendeteksi lokasi...
                      </>
                    ) : (
                      <>
                        <LocateFixed size={13} />
                        Gunakan lokasi saat ini
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    ref={addressRef}
                    id="address"
                    name="address"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (coords) setCoords(null);
                    }}
                    placeholder="Cth: Jl. Raya Sidoarjo No. 12, Jawa Timur"
                    disabled={isPending || isLocating}
                    className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white focus:ring-sky-500 focus:border-sky-500 pr-9"
                  />
                  {/* Pin indicator when address is GPS-filled */}
                  {coords && (
                    <MapPin
                      size={15}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none"
                    />
                  )}
                </div>

                {/* GPS coordinate badge */}
                {coords ? (
                  <p className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
                    📍 GPS tersimpan: {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                    Klik &quot;Gunakan lokasi saat ini&quot; untuk mengisi otomatis via GPS, atau ketik manual.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-slate-200">
                  Deskripsi
                </Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Informasi tambahan tentang farm ini..."
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
                  disabled={isPending || isLocating}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-200 dark:shadow-none"
                  disabled={isPending || isLocating}
                >
                  {isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Plus size={16} className="mr-2" />
                      Simpan Farm
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
