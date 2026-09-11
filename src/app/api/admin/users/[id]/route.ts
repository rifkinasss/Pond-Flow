import { NextResponse } from "next/server";
import { getAdminUser } from "@/shared/lib/admin";
import { recordAuditLog } from "@/shared/lib/audit";
import { sqlite } from "@/shared/lib/sqlite/db";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getAdminUser();
  if (!actor) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  const { id } = await params;
  if (id === actor.id) return NextResponse.json({ error: "Akun sendiri tidak dapat dihapus" }, { status: 400 });
  const target = sqlite.prepare("SELECT id, email, display_name, role FROM users WHERE id = ?").get(id) as { id: string; email: string; display_name: string | null; role: string } | undefined;
  if (!target) return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
  if ((target.role === "admin" || target.role === "superadmin") && actor.role !== "superadmin") return NextResponse.json({ error: "Hanya superadmin yang dapat menghapus admin" }, { status: 403 });
  recordAuditLog(actor.id, "user.deleted", id, { email: target.email, displayName: target.display_name, role: target.role });
  sqlite.prepare("DELETE FROM users WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
