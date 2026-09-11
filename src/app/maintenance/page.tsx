import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function MaintenancePage() {
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 dark:bg-slate-950"><div className="w-full max-w-md text-center"><div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"><ShieldAlert className="h-7 w-7" /></div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-sky-600">PondFlow</p><h1 className="text-2xl font-semibold tracking-tight">Sedang dalam pemeliharaan</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Aplikasi sedang diperbarui oleh administrator. Silakan coba kembali beberapa saat lagi.</p><Link href="/login" className="mt-6 inline-flex h-10 items-center rounded-lg bg-sky-600 px-4 text-sm font-medium text-white transition-colors hover:bg-sky-700">Kembali ke login</Link></div></main>;
}
