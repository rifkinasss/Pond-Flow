import { Activity } from "lucide-react";

type AuditItem = { id: string; action: string; actor_name: string | null; target_name: string | null; created_at: string };

const labels: Record<string, string> = { "user.role_updated": "mengubah role pengguna", "user.sessions_revoked": "mencabut sesi pengguna" };

export function AdminActivity({ items }: { items: AuditItem[] }) {
  return <section className="rounded-xl bg-white shadow-sm dark:bg-slate-900"><div className="flex items-center gap-3 p-5"><Activity className="h-5 w-5 text-sky-600" strokeWidth={1.8} /><div><h2 className="font-semibold">Aktivitas admin</h2><p className="mt-1 text-sm text-muted-foreground">Jejak tindakan administratif terbaru.</p></div></div>{items.length ? <div className="space-y-1 px-3 pb-3">{items.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg px-2 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50"><p><span className="font-medium">{item.actor_name || "Admin"}</span> {labels[item.action] || item.action} <span className="font-medium">{item.target_name || "akun"}</span></p><time className="shrink-0 text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString("id-ID")}</time></div>)}</div> : <p className="px-5 py-8 text-center text-sm text-muted-foreground">Belum ada aktivitas admin.</p>}</section>;
}
