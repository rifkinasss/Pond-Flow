import { redirect } from "next/navigation";
import { Activity, MapPinned, Users, Waves } from "lucide-react";
import { AdminUsersTable } from "./AdminUsersTable";
import { AdminOverviewCharts } from "./AdminOverviewCharts";
import { AdminActivity } from "./AdminActivity";
import { getAdminUser } from "@/shared/lib/admin";
import { sqlite } from "@/shared/lib/sqlite/db";

export default async function AdminPage() {
  const user = await getAdminUser();
  if (!user) redirect("/dashboard");
  const count = (table: string, where = "") => (sqlite.prepare(`SELECT COUNT(*) as count FROM ${table} ${where}`).get() as { count: number }).count;
  const stats = { users: count("users"), farms: count("farms"), ponds: count("ponds"), activeCycles: count("pond_cycles", "WHERE status = 'active'") };
  const growth = sqlite.prepare("SELECT period, SUM(users) as users, SUM(farms) as farms, SUM(ponds) as ponds FROM (SELECT strftime('%Y-%m', created_at) as period, COUNT(*) as users, 0 as farms, 0 as ponds FROM users WHERE created_at >= date('now', '-5 months') GROUP BY period UNION ALL SELECT strftime('%Y-%m', created_at), 0, COUNT(*), 0 FROM farms WHERE created_at >= date('now', '-5 months') GROUP BY strftime('%Y-%m', created_at) UNION ALL SELECT strftime('%Y-%m', created_at), 0, 0, COUNT(*) FROM ponds WHERE created_at >= date('now', '-5 months') GROUP BY strftime('%Y-%m', created_at)) GROUP BY period ORDER BY period").all() as Array<{ period: string; users: number; farms: number; ponds: number }>;
  const roles = sqlite.prepare("SELECT role as name, COUNT(*) as value FROM users GROUP BY role ORDER BY role").all() as Array<{ name: string; value: number }>;
  const activity = sqlite.prepare("SELECT logs.id, logs.action, logs.created_at, actor.display_name as actor_name, target.display_name as target_name FROM audit_logs logs LEFT JOIN users actor ON actor.id = logs.actor_id LEFT JOIN users target ON target.id = logs.target_user_id ORDER BY logs.created_at DESC LIMIT 8").all() as Array<{ id: string; action: string; actor_name: string | null; target_name: string | null; created_at: string }>;
  const users = sqlite.prepare("SELECT id, email, display_name, role, created_at FROM users ORDER BY created_at DESC").all() as Array<{ id: string; email: string; display_name: string | null; role: string; created_at: string }>;
  const cards = [
    { label: "Total pengguna", value: stats.users, icon: Users, color: "text-sky-600" },
    { label: "Total farm", value: stats.farms, icon: MapPinned, color: "text-emerald-600" },
    { label: "Total kolam", value: stats.ponds, icon: Waves, color: "text-violet-600" },
    { label: "Siklus aktif", value: stats.activeCycles, icon: Activity, color: "text-amber-600" },
  ];
  return <div className="mx-auto max-w-6xl space-y-8"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-sky-600">Administration</p><h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Admin Panel</h1><p className="mt-1 text-sm text-muted-foreground">Pantau sistem dan kelola akses pengguna PondFlow.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => { const Icon = card.icon; return <div key={card.label} className="rounded-xl bg-white px-4 py-4 shadow-sm dark:bg-slate-900"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground">{card.label}</p><p className="mt-2 text-2xl font-semibold tracking-tight">{card.value}</p></div><Icon className={`h-5 w-5 ${card.color}`} strokeWidth={1.8} /></div></div>; })}</div><AdminOverviewCharts growth={growth} roles={roles} /><AdminActivity items={activity} /><section className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-slate-900"><div className="p-5"><h2 className="font-semibold">Manajemen pengguna</h2><p className="mt-1 text-sm text-muted-foreground">Kelola role, cari akun, dan cabut sesi login perangkat lain.</p></div><AdminUsersTable users={users} currentUserId={user.id} actorRole={user.role} /></section></div>;
}
