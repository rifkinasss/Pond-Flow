"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, X, Cpu, Loader2, CheckCircle2, Copy, Key, ShieldCheck, Zap, Fish } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createIotDevice } from "@/features/iot/actions/iot.actions";

interface AddIotDeviceDialogProps {
  ponds: Array<{ id: string; name: string }>;
  onAddDevice: (newDevice: any) => void;
}

export function AddIotDeviceDialog({ ponds, onAddDevice }: AddIotDeviceDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "credentials">("form");
  const [isPending, startTransition] = useTransition();
  const [deviceCode, setDeviceCode] = useState("");
  const [selectedPondId, setSelectedPondId] = useState(ponds[0]?.id || "");
  const [deviceModel, setDeviceModel] = useState("Auto-Feeder Pelet Ikan (Super Dispense)");
  const [hopperCapacity, setHopperCapacity] = useState("50 Kg");
  const [generatedApiKey, setGeneratedApiKey] = useState("");

  const selectedPondObj = ponds.find((p) => p.id === selectedPondId);

  const handleOpen = () => {
    setOpen(true);
    setStep("form");
    setDeviceCode(`FEEDER-EX${Math.floor(100 + Math.random() * 900)}`);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pond = ponds.find((p) => p.id === selectedPondId);
    if (!pond) return;

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createIotDevice(formData);
      if (res?.error) {
        toast.error("Gagal menambahkan perangkat", { description: res.error });
      } else {
        const apiKey = `pf_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
        setGeneratedApiKey(apiKey);
        toast.success("Perangkat IoT Feeder Berhasil Disimpan ke Database! 📡");
        if (res.data) {
          const devData = res.data as any;
          onAddDevice({
            id: devData.id,
            pond_id: devData.pond_id,
            pond_name: pond.name,
            device_code: devData.device_code,
            status: devData.status || "online",
            battery_level: devData.battery_level ?? 100,
            hopper_level: devData.hopper_level ?? 100,
            daily_dispensed_kg: 0,
          });
        }
        setStep("credentials");
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Karakter disalin ke clipboard! 📋");
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-200 dark:shadow-none rounded-xl"
      >
        <Plus size={16} />
        Hubungkan Perangkat IoT
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isPending && setOpen(false)} />

          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/50">
                  <Cpu size={20} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    {step === "form" ? "Registrasi Perangkat IoT Baru" : "Kredensial IoT & Token Rahasia (API Key)"}
                  </h2>
                  <p className="text-xs text-muted-foreground dark:text-slate-400">
                    {step === "form" ? "Hubungkan alat pelontar pakan ke kolam budidaya" : "Gunakan ID Kolam & Token ini untuk memprogram mikrokontroler ESP32"}
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            {step === "form" ? (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* Model Hardware Selection */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700 dark:text-slate-200">Model Perangkat Hardware IoT</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { name: "Auto-Feeder Pelet Ikan", desc: "Lontaran Jauh 5-10m" },
                      { name: "Auto-Feeder Udang", desc: "Sirkulasi Dasar Air" },
                    ].map((m) => (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => setDeviceModel(m.name)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          deviceModel.includes(m.name.split(" ")[1])
                            ? "bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-900 dark:text-sky-200 ring-1 ring-sky-500"
                            : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300"
                        }`}
                      >
                        <p className="text-xs font-bold">{m.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-slate-400">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pond & Device Serial Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700 dark:text-slate-200">Pilih Kolam Budidaya <span className="text-red-500">*</span></Label>
                    <select
                      name="pond_id"
                      value={selectedPondId}
                      onChange={(e) => setSelectedPondId(e.target.value)}
                      required
                      disabled={isPending}
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-800 dark:text-white font-medium"
                    >
                      {ponds.map((p) => (
                        <option key={p.id} value={p.id} className="dark:bg-slate-900">
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700 dark:text-slate-200">Kode Serial Perangkat <span className="text-red-500">*</span></Label>
                    <Input
                      name="device_code"
                      placeholder="Cth: FEEDER-EX300"
                      value={deviceCode}
                      onChange={(e) => setDeviceCode(e.target.value)}
                      required
                      disabled={isPending}
                      className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 font-bold uppercase text-xs"
                    />
                  </div>
                </div>

                {/* Hopper Capacity */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700 dark:text-slate-200">Kapasitas Tabung Pakan (Hopper)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["25 Kg", "50 Kg", "100 Kg"].map((cap) => (
                      <button
                        key={cap}
                        type="button"
                        onClick={() => setHopperCapacity(cap)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          hopperCapacity === cap
                            ? "bg-sky-600 text-white border-sky-600"
                            : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700"
                        }`}
                      >
                        {cap}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl dark:border-slate-800" onClick={() => setOpen(false)} disabled={isPending}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={isPending} className="flex-1 rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-200 dark:shadow-none">
                    {isPending ? (
                      <><Loader2 size={15} className="animate-spin mr-2" /> Menyimpan...</>
                    ) : (
                      "Simpan & Generate Token"
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              /* Step 2: API Credentials Display */
              <div className="px-6 py-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 p-4 rounded-2xl flex items-start gap-3">
                  <CheckCircle2 size={24} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">Perangkat Berhasil Terregistrasi!</h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                      Perangkat <strong>{deviceCode}</strong> siap dihubungkan dengan mikrokontroler di lokasi tambak.
                    </p>
                  </div>
                </div>

                {/* Assigned Pond Identifier Box */}
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-600 dark:text-slate-400 flex items-center gap-1.5"><Fish size={14} className="text-sky-500" /> Kolam Terhubung:</span>
                    <span className="font-extrabold text-gray-900 dark:text-white">{selectedPondObj?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200/60 dark:border-slate-700/60">
                    <span className="text-gray-500 dark:text-slate-400 font-mono text-[11px]">ID Kolam (`pond_id`):</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[11px] font-bold text-sky-600 dark:text-sky-400 truncate max-w-[170px]">{selectedPondId}</span>
                      <button onClick={() => copyToClipboard(selectedPondId)} className="text-gray-400 hover:text-sky-600 p-1">
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Key size={14} className="text-amber-500" />
                    Kunci Token Rahasia Hardware (Secret Token)
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedApiKey}
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-xs font-mono font-bold text-sky-600 dark:text-sky-400"
                    />
                    <button
                      onClick={() => copyToClipboard(generatedApiKey)}
                      className="h-10 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center shrink-0"
                      title="Salin Kunci Token"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                    🔒 Masukkan `pond_id` dan `Secret Token` ini ke dalam firmware ESP32 / Arduino sebagai header autentikasi HTTP request telemetry.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => setOpen(false)}
                    className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                  >
                    Selesai & Tutup
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
