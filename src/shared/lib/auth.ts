import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { sqlite } from "./sqlite/db";

const COOKIE = "pondflow_session";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "change-this-secret-in-production");
const sessionDays = 30;

export type AppUser = {
  id: string; email: string; role: "user" | "admin" | "superadmin"; user_metadata: { display_name?: string; phone?: string; business_name?: string; avatar?: string };
};

function toUser(row: any): AppUser { return { id: row.id, email: row.email, role: row.role ?? "user", user_metadata: { display_name: row.display_name ?? undefined, phone: row.phone ?? undefined, business_name: row.business_name ?? undefined, avatar: row.avatar ?? undefined } }; }

export async function getCurrentUser(): Promise<AppUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const row = sqlite.prepare("SELECT * FROM users WHERE id = ?").get(payload.sub) as any;
    if (!row) return null;
    const expires = sqlite.prepare("SELECT expires_at FROM sessions WHERE id = ? AND user_id = ?").get(payload.jti, row.id) as any;
    if (!expires || new Date(expires.expires_at) <= new Date()) return null;
    return toUser(row);
  } catch { return null; }
}

export async function createSession(userId: string) {
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + sessionDays * 86400000).toISOString();
  sqlite.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)").run(id, userId, expiresAt);
  const token = await new SignJWT({ sub: userId }).setProtectedHeader({ alg: "HS256" }).setJti(id).setIssuedAt().setExpirationTime(`${sessionDays}d`).sign(secret);
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: new Date(expiresAt) });
}

export async function clearSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) { try { const { payload } = await jwtVerify(token, secret); sqlite.prepare("DELETE FROM sessions WHERE id = ?").run(payload.jti); } catch {} }
  store.delete(COOKIE);
}

export async function registerUser(email: string, password: string, displayName: string) {
  const normalized = email.trim().toLowerCase();
  if (sqlite.prepare("SELECT id FROM users WHERE email = ?").get(normalized)) throw new Error("Email sudah terdaftar");
  const userId = randomUUID();
  sqlite.prepare("INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)").run(userId, normalized, await bcrypt.hash(password, 12), displayName.trim());
  return userId;
}

export async function loginUser(email: string, password: string) {
  const row = sqlite.prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase()) as any;
  if (!row || !(await bcrypt.compare(password, row.password_hash))) throw new Error("Invalid login credentials");
  return row.id as string;
}

export function createPasswordResetToken(email: string) {
  const row = sqlite.prepare("SELECT id FROM users WHERE email = ?").get(email.trim().toLowerCase()) as { id: string } | undefined;
  if (!row) return null;
  const token = randomUUID().replaceAll("-", "");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  sqlite.prepare("DELETE FROM password_reset_tokens WHERE user_id = ?").run(row.id);
  sqlite.prepare("INSERT INTO password_reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)").run(token, row.id, expiresAt);
  return { token, expiresAt };
}

export async function resetPassword(token: string, password: string) {
  const record = sqlite.prepare("SELECT user_id, expires_at FROM password_reset_tokens WHERE token = ? AND used_at IS NULL").get(token) as { user_id: string; expires_at: string } | undefined;
  if (!record || new Date(record.expires_at) <= new Date()) throw new Error("Token reset tidak valid atau sudah kedaluwarsa");
  const passwordHash = await bcrypt.hash(password, 12);
  const save = sqlite.transaction(() => {
    sqlite.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, record.user_id);
    sqlite.prepare("UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE token = ?").run(token);
    sqlite.prepare("DELETE FROM sessions WHERE user_id = ?").run(record.user_id);
  });
  save();
}

export { COOKIE, toUser };
