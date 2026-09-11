import { NextResponse } from "next/server";
import { getAdminUser } from "@/shared/lib/admin";
import { recordAuditLog } from "@/shared/lib/audit";
import { getSystemSetting, setSystemSetting } from "@/shared/lib/settings";

const allowedKeys = ["registration_enabled", "maintenance_mode"] as const;

export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  return NextResponse.json(Object.fromEntries(allowedKeys.map((key) => [key, getSystemSetting(key, key === "registration_enabled" ? "true" : "false") === "true"])));
}

export async function PATCH(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const changed: Record<string, boolean> = {};
  for (const key of allowedKeys) {
    if (typeof body[key] === "boolean") { setSystemSetting(key, String(body[key]), user.id); changed[key] = body[key]; }
  }
  if (Object.keys(changed).length) recordAuditLog(user.id, "system.settings_updated", undefined, changed);
  return NextResponse.json({ ok: true, settings: changed });
}
