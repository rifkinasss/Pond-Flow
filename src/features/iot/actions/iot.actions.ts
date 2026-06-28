"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";
import { recordFeeding } from "@/features/pond/actions/feed.actions";

export async function createIotDevice(formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Pengguna tidak terautentikasi" };

    const pond_id = formData.get("pond_id") as string;
    const device_code = (formData.get("device_code") as string)?.toUpperCase();

    if (!pond_id || !device_code) {
      return { error: "Semua bidang wajib diisi" };
    }

    const { data, error } = await (supabase.from("iot_devices") as any).insert({
      user_id: user.id,
      pond_id,
      device_code,
      status: "online",
      battery_level: 100,
      hopper_level: 100,
    }).select().single();

    if (error) throw error;

    revalidatePath("/dashboard/iot");
    return { data };
  } catch (error: any) {
    return { error: error.message || "Gagal menghubungkan perangkat IoT" };
  }
}

export async function triggerRemoteDispense(deviceId: string, pondId: string, cycleId: string, amountKg: number) {
  try {
    const supabase = await createClient();

    // 1. Update device status to feeding
    await (supabase.from("iot_devices") as any).update({
      status: "feeding",
      last_ping: new Date().toISOString(),
    }).eq("id", deviceId);

    // 2. Record Feeding Log & Inventory deduction
    const formData = new FormData();
    formData.set("cycle_id", cycleId);
    formData.set("amount_kg", String(amountKg));
    formData.set("inventory_item_id", "none");
    formData.set("unit_price", "12000");
    formData.set("notes", "🤖 Pakan otomatis dilontar via Perangkat IoT Auto-Feeder");

    const result = await recordFeeding(formData);

    // 3. Update device status back to online & reduce hopper level
    const { data: dev } = await (supabase.from("iot_devices") as any).select("hopper_level").eq("id", deviceId).single();
    const newHopper = Math.max(0, (dev?.hopper_level || 100) - 5);

    await (supabase.from("iot_devices") as any).update({
      status: "online",
      hopper_level: newHopper,
      last_ping: new Date().toISOString(),
    }).eq("id", deviceId);

    revalidatePath("/dashboard/iot");
    revalidatePath("/dashboard/ponds");
    return result;
  } catch (error: any) {
    return { error: error.message || "Gagal memicu dispenser IoT" };
  }
}
