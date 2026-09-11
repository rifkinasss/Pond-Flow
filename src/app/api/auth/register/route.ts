import { NextResponse } from "next/server";
import { createSession, registerUser } from "@/shared/lib/auth";
import { getSystemSetting } from "@/shared/lib/settings";
export async function POST(request: Request) {
  try { if (getSystemSetting("registration_enabled", "true") !== "true") return NextResponse.json({ error: "Pendaftaran sedang dinonaktifkan oleh administrator" }, { status: 403 }); const { email, password, displayName } = await request.json(); if (!email || !password || password.length < 8) return NextResponse.json({ error: "Email dan password minimal 8 karakter wajib diisi" }, { status: 400 }); const id = await registerUser(email, password, displayName || ""); await createSession(id); return NextResponse.json({ success: true }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Pendaftaran gagal" }, { status: 400 }); }
}
