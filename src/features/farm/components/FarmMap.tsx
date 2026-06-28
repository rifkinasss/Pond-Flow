"use client";

import dynamic from "next/dynamic";
import { MapPin, Loader2 } from "lucide-react";
import type { FarmLocation } from "./FarmMapInner";

const FarmMapInner = dynamic(() => import("./FarmMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-slate-800">
      <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
        Memuat peta lokasi...
      </div>
    </div>
  ),
});

interface FarmMapProps {
  farms: Array<{
    id: string;
    name: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
  }>;
}

export function FarmMap({ farms }: FarmMapProps) {
  // Filter farms that have valid lat/lon coordinates
  const validFarms: FarmLocation[] = farms.filter(
    (f): f is FarmLocation =>
      typeof f.latitude === "number" &&
      typeof f.longitude === "number" &&
      !isNaN(f.latitude) &&
      !isNaN(f.longitude)
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center border border-sky-100 dark:border-sky-800/50">
            <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
              Peta Lokasi Farm
            </h2>
            <p className="text-xs text-muted-foreground dark:text-slate-400">
              {validFarms.length} dari {farms.length} farm terpetakan GPS
            </p>
          </div>
        </div>
      </div>

      <div className="w-full h-[380px] relative overflow-hidden rounded-xl border border-gray-100 dark:border-slate-800 shadow-inner">
        {validFarms.length === 0 ? (
          <div className="w-full h-full bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
            <MapPin className="w-10 h-10 text-gray-300 dark:text-slate-600 mb-2" />
            <p className="font-medium text-gray-700 dark:text-slate-200 text-sm">Belum ada lokasi tersimpan di peta</p>
            <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1 max-w-sm">
              Tambahkan farm baru menggunakan tombol &quot;Gunakan lokasi saat ini&quot; untuk menampilkan pin di peta ini.
            </p>
          </div>
        ) : (
          <FarmMapInner farms={validFarms} />
        )}
      </div>
    </div>
  );
}
