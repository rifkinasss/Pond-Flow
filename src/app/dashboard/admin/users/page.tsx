import { redirect } from "next/navigation";
import { AdminUsersTable } from "../AdminUsersTable";
import { getAdminUser } from "@/shared/lib/admin";
import { sqlite } from "@/shared/lib/sqlite/db";

export default async function AdminUsersPage() {
  const user = await getAdminUser();
  if (!user) redirect("/dashboard");
  const users = sqlite.prepare("SELECT id, email, display_name, role, created_at FROM users ORDER BY created_at DESC").all() as Array<{ id: string; email: string; display_name: string | null; role: string; created_at: string }>;
  return <div className="mx-auto max-w-6xl space-y-8"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-sky-600">Administration</p><h1 className="text-2xl font-semibold tracking-tight">User management</h1><p className="mt-1 text-sm text-muted-foreground">Kelola role dan sesi login semua pengguna PondFlow.</p></div><section className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-slate-900"><div className="p-5"><h2 className="font-semibold">Daftar pengguna</h2><p className="mt-1 text-sm text-muted-foreground">Perubahan akses dicatat secara langsung pada database lokal.</p></div><AdminUsersTable users={users} currentUserId={user.id} actorRole={user.role} /></section></div>;
}
