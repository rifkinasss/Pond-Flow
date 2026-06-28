"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Clock, Plus, Trash2, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScheduleItem {
  id: string;
  time: string;
  amountGrams: number;
}

interface FeedingScheduleDialogProps {
  deviceCode: string;
  pondName: string;
}

export function FeedingScheduleDialog({ deviceCode, pondName }: FeedingScheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    { id: "s1", time: "07:00", amountGrams: 500 },
    { id: "s2", time: "12:00", amountGrams: 500 },
    { id: "s3", time: "16:30", amountGrams: 500 },
  ]);
  const [newTime, setNewTime] = useState("20:00");
  const [newGrams, setNewGrams] = useState("500");

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setSchedules((prev) => [
      ...prev,
      { id: Date.now().toString(), time: newTime, amountGrams: Number(newGrams) || 500 },
    ]);
    toast.success("Jadwal lontar pakan ditambahkan! ⏰");
  };

  const handleDelete = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    toast.success("Jadwal dihapus");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 transition-colors"
        title="Pengaturan Jadwal Auto-Feeder"
      >
        <Settings size={16} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
                  <Clock size={20} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Jadwal Lontar Pakan ({deviceCode})</h2>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">Kolam: {pondName}</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Existing Schedules */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-200">Timer Pakan Otomatis Aktif</label>
                {schedules.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Belum ada timer jadwal.</p>
                ) : (
                  <div className="space-y-2">
                    {schedules.map((s) => (
                      <div key={s.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 rounded-xl border border-gray-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-sky-500" />
                          <span className="font-bold text-gray-900 dark:text-white text-sm">{s.time} WIB</span>
                          <span className="text-xs text-gray-500 dark:text-slate-400">({s.amountGrams} gram)</span>
                        </div>
                        <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Schedule Form */}
              <form onSubmit={handleAddSchedule} className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-3">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-200">Tambah Timer Jam Baru</label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    required
                    className="h-10 px-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <input
                    type="number"
                    step="50"
                    value={newGrams}
                    onChange={(e) => setNewGrams(e.target.value)}
                    placeholder="Grams"
                    required
                    className="w-24 h-10 px-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <span className="text-xs text-gray-400 font-medium">gr</span>
                  <Button type="submit" className="h-10 bg-sky-600 hover:bg-sky-700 text-white rounded-xl px-4 text-xs font-semibold shrink-0">
                    <Plus size={14} className="mr-1" /> Tambah
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
