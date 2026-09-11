import { NextResponse } from "next/server";
import { createPasswordResetToken } from "@/shared/lib/auth";
import { appConfig } from "@/shared/lib/config";
export async function POST(request: Request) {
  const { email } = await request.json();
  const reset = createPasswordResetToken(email || "");
  // Pengiriman sengaja belum diaktifkan. Konfigurasi SMTP sudah tersedia di env.
  if (reset && !appConfig.mail.enabled && process.env.NODE_ENV !== "production") console.info(`[PondFlow] Password reset URL (development only): /reset-password?token=${reset.token}`);
  return NextResponse.json({ success: true, message: "Jika email terdaftar, instruksi reset akan diproses." });
}
