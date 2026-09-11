import { NextResponse } from "next/server";
import { createSession, loginUser } from "@/shared/lib/auth";
import { rateLimit } from "@/shared/lib/rate-limit";
export async function POST(request: Request) {
  try { const { email, password } = await request.json(); const key = `login:${request.headers.get("x-forwarded-for") || "unknown"}:${String(email).toLowerCase()}`; const guard = rateLimit(key, 8, 15 * 60 * 1000); if (!guard.allowed) return NextResponse.json({ error: "Terlalu banyak percobaan login" }, { status: 429, headers: { "Retry-After": String(guard.retryAfter) } }); const id = await loginUser(email, password); await createSession(id); return NextResponse.json({ success: true }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Login gagal" }, { status: 401 }); }
}
