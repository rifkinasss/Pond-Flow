import { NextResponse } from "next/server";
import { getAdminUser } from "@/shared/lib/admin";
import { sqlite } from "@/shared/lib/sqlite/db";
import { recordAuditLog } from "@/shared/lib/audit";

const roles = new Set(["user", "admin", "superadmin"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getAdminUser();
  if (!actor) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const role = typeof body.role === "string" ? body.role : "";
  if (!roles.has(role)) return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
  if (id === actor.id) return NextResponse.json({ error: "Role akun sendiri tidak dapat diubah" }, { status: 400 });
  if (role === "superadmin" && actor.role !== "superadmin") return NextResponse.json({ error: "Hanya superadmin yang dapat memberikan role superadmin" }, { status: 403 });
  const result = sqlite.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, id);
  if (result.changes === 0) return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
  recordAuditLog(actor.id, "user.role_updated", id, { role });
  return NextResponse.json({ ok: true, role });
}
