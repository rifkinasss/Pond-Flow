import { NextResponse } from "next/server";
import { getAdminUser } from "@/shared/lib/admin";
import { sqlite } from "@/shared/lib/sqlite/db";
import { recordAuditLog } from "@/shared/lib/audit";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getAdminUser();
  if (!actor) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  const { id } = await params;
  const user = sqlite.prepare("SELECT id FROM users WHERE id = ?").get(id);
  if (!user) return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
  const result = sqlite.prepare("DELETE FROM sessions WHERE user_id = ?").run(id);
  recordAuditLog(actor.id, "user.sessions_revoked", id, { revoked: result.changes });
  return NextResponse.json({ ok: true, revoked: result.changes });
}
