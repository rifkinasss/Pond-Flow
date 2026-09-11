import { redirect } from "next/navigation";
import { Database, Mail, Server, ShieldCheck } from "lucide-react";
import { getAdminUser } from "@/shared/lib/admin";
import { AdminSettingsForm } from "./AdminSettingsForm";

export default async function AdminSettingsPage() {
  const user = await getAdminUser();
  if (!user) redirect("/dashboard");
  const settings = [
    { label: "Environment", value: process.env.NODE_ENV || "development", icon: Server },
    { label: "Database", value: "SQLite · local backend", icon: Database },
    { label: "Email reset password", value: process.env.MAIL_ENABLED === "true" ? "Enabled" : "Disabled", icon: Mail },
    { label: "Authentication", value: "JWT + httpOnly session cookie", icon: ShieldCheck },
  ];
  return <div className="mx-auto max-w-4xl space-y-8"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-sky-600">Administration</p><h1 className="text-2xl font-semibold tracking-tight">System settings</h1><p className="mt-1 text-sm text-muted-foreground">Kelola kontrol operasional dan lihat konfigurasi runtime server.</p></div><AdminSettingsForm /><section className="rounded-xl bg-white shadow-sm dark:bg-slate-900"><div className="p-5"><h2 className="font-semibold">Runtime configuration</h2><p className="mt-1 text-sm text-muted-foreground">Nilai sensitif tidak ditampilkan. Konfigurasi deployment tetap dikelola melalui environment server.</p></div><div className="space-y-1 px-3 pb-3">{settings.map(({ label, value, icon: Icon }) => <div key={label} className="flex items-center gap-4 rounded-lg px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"><Icon className="h-5 w-5 text-slate-500" strokeWidth={1.8} /><div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-medium">{value}</p></div></div>)}</div></section></div>;
}
