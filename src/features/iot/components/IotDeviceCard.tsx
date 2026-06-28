"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { Cpu, Wifi, Battery, Play, Clock, Settings, AlertCircle, Loader2 } from "lucide-react";
import type { IotDevice } from "@/shared/types/iot.types";
import { triggerRemoteDispense } from "@/features/iot/actions/iot.actions";
import { FeedingScheduleDialog } from "./FeedingScheduleDialog";

interface IotDeviceCardProps {
  device: IotDevice;
  cycleId?: string;
}

export function IotDeviceCard({ device, cycleId }: IotDeviceCardProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(device.status);
  const [hopper, setHopper] = useState(device.hopper_level);

  useEffect(() => {
    setStatus(device.status);
    setHopper(device.hopper_level);
  }, [device.status, device.hopper_level]);

  const handleDispenseNow = () => {
    if (!cycleId) {
      toast.error("Kolam belum memiliki siklus budidaya aktif!");
      return;
    }

    setStatus("feeding");
    startTransition(async () => {
      const res = await triggerRemoteDispense(device.id, device.pond_id, cycleId, 0.5);
      if (res?.error) {
        toast.error("Gagal melontar pakan", { description: res.error });
        setStatus("online");
      } else {
        toast.success(`Sinyal Realtime Terkirim! Perangkat melontar 0.5 kg pakan ke ${device.pond_name} 🤖🌾`);
        setStatus("online");
        setHopper((prev) => Math.max(0, prev - 5));
      }
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all space-y-4">
      {/* Top Bar: Name & Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/50">
            <Cpu size={22} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-1.5">
              {device.device_code}
            </h3>
            <p className="text-xs text-muted-foreground dark:text-slate-400">
              Kolam: <strong className="text-gray-800 dark:text-slate-200">{device.pond_name}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              status === "feeding"
                ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50 animate-pulse"
                : status === "online"
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50"
                : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700"
            }`}
          >
            <Wifi size={12} />
            {status === "feeding" ? "Lontar Pakan..." : status === "online" ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* Telemetry Grid */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Battery */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-gray-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-medium"><Battery size={13} /> Daya Baterai</span>
            <span className="font-bold text-gray-900 dark:text-white">{device.battery_level}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              style={{ width: `${device.battery_level}%` }}
              className={`h-full rounded-full ${device.battery_level > 20 ? "bg-emerald-500" : "bg-red-500"}`}
            />
          </div>
        </div>

        {/* Hopper Level */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-gray-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-medium">🌾 Isi Tabung</span>
            <span className="font-bold text-gray-900 dark:text-white">{hopper}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              style={{ width: `${hopper}%` }}
              className={`h-full rounded-full ${hopper > 20 ? "bg-amber-500" : "bg-rose-500"}`}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={handleDispenseNow}
          disabled={isPending || status === "offline"}
          className="flex-1 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-sky-200 dark:shadow-none transition-all"
        >
          {isPending ? (
            <><Loader2 size={14} className="animate-spin" /> Melontar...</>
          ) : (
            <><Play size={14} /> Lontar Pakan (0.5kg)</>
          )}
        </button>
        <FeedingScheduleDialog deviceCode={device.device_code} pondName={device.pond_name} />
      </div>
    </div>
  );
}
