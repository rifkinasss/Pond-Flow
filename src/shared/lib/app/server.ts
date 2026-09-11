import { getCurrentUser, createSession, clearSession } from "@/shared/lib/auth";
import { db } from "@/shared/lib/sqlite/db";
import { sqlite } from "@/shared/lib/sqlite/db";

export async function createClient() {
  const database = db();
  return {
    from: database.from,
    auth: {
      getUser: async () => ({ data: { user: await getCurrentUser() } }),
      signOut: async () => { await clearSession(); return { error: null }; },
      updateUser: async (updates: { data?: Record<string, string>; password?: string }) => {
        const user = await getCurrentUser(); if (!user) return { error: new Error("Not authenticated") };
        if (updates.password) {
          const bcrypt = await import("bcryptjs");
          sqlite.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(await bcrypt.hash(updates.password, 12), user.id);
        }
        if (updates.data) {
          const d = updates.data;
          sqlite.prepare("UPDATE users SET display_name = COALESCE(?, display_name), phone = COALESCE(?, phone), business_name = COALESCE(?, business_name), avatar = COALESCE(?, avatar) WHERE id = ?").run(d.display_name ?? null, d.phone ?? null, d.business_name ?? null, d.avatar ?? null, user.id);
        }
        return { error: null };
      },
      _createSession: createSession,
    },
  };
}
