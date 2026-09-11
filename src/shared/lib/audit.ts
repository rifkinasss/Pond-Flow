import { randomUUID } from "node:crypto";
import { sqlite } from "@/shared/lib/sqlite/db";

export function recordAuditLog(actorId: string, action: string, targetUserId?: string, metadata?: Record<string, unknown>) {
  sqlite.prepare("INSERT INTO audit_logs (id, actor_id, action, target_user_id, metadata) VALUES (?, ?, ?, ?, ?)").run(randomUUID(), actorId, action, targetUserId ?? null, metadata ? JSON.stringify(metadata) : null);
}
