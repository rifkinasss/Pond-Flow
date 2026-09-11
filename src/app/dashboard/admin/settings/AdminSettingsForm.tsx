"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Settings = { registration_enabled: boolean; maintenance_mode: boolean };

export function AdminSettingsForm() {
  const [settings, setSettings] = useState<Settings>({ registration_enabled: true, maintenance_mode: false });
  const [pending, startTransition] = useTransition();
  useEffect(() => { fetch("/api/admin/settings").then((response) => response.ok ? response.json() : null).then((data) => data && setSettings(data)).catch(() => toast.error("Pengaturan gagal dimuat")); }, []);
  const update = (key: keyof Settings, value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    startTransition(async () => {
      const response = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [key]: value }) });
      if (!response.ok) { setSettings(settings); toast.error("Pengaturan gagal disimpan"); } else toast.success("Pengaturan disimpan");
    });
  };
  const items = [{ key: "registration_enabled" as const, title: "Pendaftaran publik", description: "Izinkan pengguna baru membuat akun melalui halaman register." }, { key: "maintenance_mode" as const, title: "Maintenance mode", description: "Tandai instance sedang dalam pemeliharaan untuk kontrol operasional." }];
  return <Card className="border-0 bg-white shadow-sm dark:bg-slate-900"><CardHeader><CardTitle>Operational settings</CardTitle><CardDescription>Pengaturan ini tersimpan di SQLite dan berlaku untuk seluruh instance.</CardDescription></CardHeader><CardContent className="space-y-2">{items.map((item) => <div key={item.key} className="flex items-center justify-between gap-6 rounded-lg px-3 py-4 hover:bg-muted/50"><div><p className="font-medium">{item.title}</p><p className="mt-1 text-sm text-muted-foreground">{item.description}</p></div><button type="button" role="switch" aria-checked={settings[item.key]} disabled={pending} onClick={() => update(item.key, !settings[item.key])} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${settings[item.key] ? "bg-sky-600" : "bg-slate-300 dark:bg-slate-700"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${settings[item.key] ? "left-6" : "left-1"}`} /></button></div>)}</CardContent></Card>;
}
