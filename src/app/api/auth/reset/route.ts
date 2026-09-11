import { NextResponse } from "next/server";
import { resetPassword } from "@/shared/lib/auth";
export async function POST(request: Request) {
  try { const { token, password } = await request.json(); if (!token || typeof password !== "string" || password.length < 8) return NextResponse.json({ error: "Token dan password minimal 8 karakter wajib diisi" }, { status: 400 }); await resetPassword(token, password); return NextResponse.json({ success: true }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal mengubah password" }, { status: 400 }); }
}
