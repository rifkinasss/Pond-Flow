"use server";

import { revalidatePath } from "next/cache";
import { recordFeeding } from "@/features/pond/actions/feed.actions";
import { ownsFeeder, ownsPond, ownsCycle } from "@/shared/lib/authorization";
import { getCurrentUser } from "@/shared/lib/auth";
import { sqlite } from "@/shared/lib/sqlite/db";
import { randomUUID } from "node:crypto";

export async function createIotDevice(formData: FormData) {
  try {
    const user = await getCurrentUser();

    if (!user) return { error: "Pengguna tidak terautentikasi" };

    const pond_id = formData.get("pond_id") as string;
    const device_code = (formData.get("device_code") as string)?.toUpperCase();

    if (!pond_id || !device_code) {
      return { error: "Semua bidang wajib diisi" };
    }
    if (!ownsPond(user.id, pond_id)) return { error: "Kolam tidak ditemukan atau Anda tidak memiliki akses" };

    const id = randomUUID();
    sqlite.prepare("INSERT INTO iot_devices (id, user_id, pond_id, device_code, status, battery_level, hopper_level) VALUES (?, ?, ?, ?, 'online', 100, 100)").run(id, user.id, pond_id, device_code);
    const data = sqlite.prepare("SELECT * FROM iot_devices WHERE id = ?").get(id);

    revalidatePath("/dashboard/iot");
    return { data };
  } catch (error: any) {
    return { error: error.message || "Gagal menghubungkan perangkat IoT" };
  }
}

export async function triggerRemoteDispense(deviceId: string, pondId: string, cycleId: string, amountKg: number) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Pengguna tidak terautentikasi" };
    if (!ownsFeeder(user.id, deviceId) || !ownsPond(user.id, pondId) || !ownsCycle(user.id, cycleId)) return { error: "Perangkat atau siklus tidak ditemukan" };

    // 1. Update device status to feeding
    sqlite.prepare("UPDATE iot_devices SET status = 'feeding', last_ping = ? WHERE id = ? AND user_id = ?").run(new Date().toISOString(), deviceId, user.id);

    // 2. Record Feeding Log & Inventory deduction
    const formData = new FormData();
    formData.set("cycle_id", cycleId);
    formData.set("amount_kg", String(amountKg));
    formData.set("inventory_item_id", "none");
    formData.set("unit_price", "12000");
    formData.set("notes", "🤖 Pakan otomatis dilontar via Perangkat IoT Auto-Feeder");

    const result = await recordFeeding(formData);

    // 3. Update device status back to online & reduce hopper level
    const dev = sqlite.prepare("SELECT hopper_level FROM iot_devices WHERE id = ? AND user_id = ?").get(deviceId, user.id) as { hopper_level: number } | undefined;
    const newHopper = Math.max(0, (dev?.hopper_level || 100) - 5);

    sqlite.prepare("UPDATE iot_devices SET status = 'online', hopper_level = ?, last_ping = ? WHERE id = ? AND user_id = ?").run(newHopper, new Date().toISOString(), deviceId, user.id);

    revalidatePath("/dashboard/iot");
    revalidatePath("/dashboard/ponds");
    return result;
  } catch (error: any) {
    return { error: error.message || "Gagal memicu dispenser IoT" };
  }
}
