"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { LogOut, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type AdminUser = { id: string; email: string; display_name: string | null; role: string; created_at: string };

export function AdminUsersTable({ users, currentUserId, actorRole }: { users: AdminUser[]; currentUserId: string; actorRole: string }) {
  const [items, setItems] = useState(users);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ displayName: "", email: "", password: "", role: "user" });
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [, startTransition] = useTransition();
  const filteredItems = useMemo(() => items.filter((user) => `${user.display_name || ""} ${user.email} ${user.role}`.toLowerCase().includes(query.toLowerCase().trim())), [items, query]);

  const updateRole = (id: string, role: string) => {
    setPendingId(id);
    startTransition(async () => {
      const response = await fetch(`/api/admin/users/${id}/role`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
      const body = await response.json();
      if (!response.ok) toast.error(body.error || "Role gagal diperbarui");
      else { setItems((current) => current.map((user) => user.id === id ? { ...user, role } : user)); toast.success("Role pengguna diperbarui"); }
      setPendingId(null);
    });
  };

  const revokeSessions = (id: string) => {
    if (!window.confirm("Cabut semua sesi pengguna ini? Mereka akan logout dari semua perangkat.")) return;
    setPendingId(id);
    startTransition(async () => {
      const response = await fetch(`/api/admin/users/${id}/sessions`, { method: "DELETE" });
      const body = await response.json();
      if (response.ok) toast.success(`${body.revoked} sesi dicabut`);
      else toast.error(body.error || "Sesi gagal dicabut");
      setPendingId(null);
    });
  };
  const createUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPendingId("new");
    startTransition(async () => {
      const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const body = await response.json();
      if (!response.ok) toast.error(body.error || "Pengguna gagal dibuat");
      else { setItems((current) => [body.user, ...current]); setForm({ displayName: "", email: "", password: "", role: "user" }); setDialogOpen(false); toast.success("Pengguna berhasil ditambahkan"); }
      setPendingId(null);
    });
  };
  const removeUser = () => {
    if (!deleteUser) return;
    const id = deleteUser.id;
    setPendingId(id);
    startTransition(async () => {
      const response = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) toast.error(body.error || "Pengguna gagal dihapus");
      else { setItems((current) => current.filter((user) => user.id !== id)); setDeleteUser(null); toast.success("Pengguna dihapus"); }
      setPendingId(null);
    });
  };

  return <>
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"><label className="relative block max-w-sm flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, email, atau role" className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950" /></label><Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" /> Tambah pengguna</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Tambah pengguna</DialogTitle><DialogDescription>Buat akun baru dan tentukan role aksesnya.</DialogDescription></DialogHeader><form onSubmit={createUser} className="space-y-4"><div className="space-y-2"><Label htmlFor="admin-name">Nama</Label><Input id="admin-name" required value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} /></div><div className="space-y-2"><Label htmlFor="admin-email">Email</Label><Input id="admin-email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div><div className="space-y-2"><Label htmlFor="admin-password">Password</Label><Input id="admin-password" type="password" minLength={8} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></div><div className="space-y-2"><Label htmlFor="admin-role">Role</Label><select id="admin-role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"><option value="user">User</option><option value="admin">Admin</option><option value="superadmin" disabled={actorRole !== "superadmin"}>Superadmin</option></select></div><DialogFooter><Button type="submit" disabled={pendingId === "new"}>{pendingId === "new" ? "Menyimpan…" : "Buat pengguna"}</Button></DialogFooter></form></DialogContent></Dialog></div>
    <Table className="min-w-[760px]"><TableHeader><TableRow className="bg-slate-50/80 hover:bg-slate-50/80 dark:bg-slate-950/50 dark:hover:bg-slate-950/50"><TableHead>Pengguna</TableHead><TableHead>Terdaftar</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader><TableBody>{filteredItems.map((user) => <TableRow key={user.id}><TableCell><p className="font-medium text-slate-900 dark:text-white">{user.display_name || "Tanpa nama"}</p><p className="text-xs text-muted-foreground">{user.email}</p></TableCell><TableCell className="text-muted-foreground">{new Date(user.created_at).toLocaleDateString("id-ID")}</TableCell><TableCell>{user.id === currentUserId ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{user.role} (Anda)</span> : <select value={user.role} disabled={pendingId === user.id} onChange={(event) => updateRole(user.id, event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900"><option value="user">user</option><option value="admin">admin</option><option value="superadmin" disabled={actorRole !== "superadmin"}>superadmin</option></select>}</TableCell><TableCell className="text-right"><div className="flex justify-end gap-1">{user.id !== currentUserId && <button disabled={pendingId === user.id} onClick={() => revokeSessions(user.id)} title="Cabut semua sesi" className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"><LogOut className="h-3.5 w-3.5" /> Cabut sesi</button>}{user.id !== currentUserId && (actorRole === "superadmin" || user.role === "user") && <button disabled={pendingId === user.id} onClick={() => setDeleteUser(user)} title="Hapus pengguna" className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"><Trash2 className="h-4 w-4" /></button>}</div></TableCell></TableRow>)}</TableBody></Table>
    {filteredItems.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted-foreground">Pengguna tidak ditemukan.</p>}
    <AlertDialog open={Boolean(deleteUser)} onOpenChange={(open) => !open && setDeleteUser(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus pengguna?</AlertDialogTitle><AlertDialogDescription>Akun {deleteUser?.email} dan data terkaitnya akan dihapus. Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={pendingId === deleteUser?.id}>Batal</AlertDialogCancel><AlertDialogAction onClick={removeUser} disabled={pendingId === deleteUser?.id} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{pendingId === deleteUser?.id ? "Menghapus…" : "Hapus pengguna"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </>;
}
