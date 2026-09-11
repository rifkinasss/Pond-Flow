import { sqlite } from "@/shared/lib/sqlite/db";

export function getSystemSetting(key: string, fallback = "") {
  const row = sqlite.prepare("SELECT value FROM system_settings WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value ?? fallback;
}

export function setSystemSetting(key: string, value: string, updatedBy: string) {
  sqlite.prepare("INSERT INTO system_settings (key, value, updated_by, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_by = excluded.updated_by, updated_at = CURRENT_TIMESTAMP").run(key, value, updatedBy);
}
