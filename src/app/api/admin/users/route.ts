import { NextResponse } from "next/server";
import { getAdminUser } from "@/shared/lib/admin";
import { recordAuditLog } from "@/shared/lib/audit";
import { registerUser } from "@/shared/lib/auth";
import { sqlite } from "@/shared/lib/sqlite/db";

export async function POST(request: Request) {
  const actor = await getAdminUser();
  if (!actor) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role = body.role === "admin" || body.role === "superadmin" ? body.role : "user";
    if (!email || !displayName || password.length < 8) return NextResponse.json({ error: "Nama, email, dan password minimal 8 karakter wajib diisi" }, { status: 400 });
    if (role === "superadmin" && actor.role !== "superadmin") return NextResponse.json({ error: "Hanya superadmin yang dapat membuat superadmin" }, { status: 403 });
    const id = await registerUser(email, password, displayName);
    if (role !== "user") sqlite.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, id);
    recordAuditLog(actor.id, "user.created", id, { role });
    const created = sqlite.prepare("SELECT id, email, display_name, role, created_at FROM users WHERE id = ?").get(id);
    return NextResponse.json({ user: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Pengguna gagal dibuat" }, { status: 400 });
  }
}
