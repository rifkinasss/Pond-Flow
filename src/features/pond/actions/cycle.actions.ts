"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/app/server";
import { ownsCycle, ownsPond } from "@/shared/lib/authorization";
import { sqlite } from "@/shared/lib/sqlite/db";

export async function startCycle(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const pondId = formData.get("pond_id") as string;
  const fishType = formData.get("fish_type") as string;
  const initialStockStr = formData.get("initial_stock") as string;
  const startDate = formData.get("start_date") as string;
  const targetDaysStr = formData.get("target_days") as string;

  if (!pondId) return { error: "Kolam tidak valid" };
  if (!ownsPond(user.id, pondId)) return { error: "Kolam tidak ditemukan atau Anda tidak memiliki akses" };
  if (!fishType || fishType.trim().length < 2) {
    return { error: "Jenis komoditas/ikan wajib diisi" };
  }

  const stock = parseInt(initialStockStr, 10);
  if (isNaN(stock) || stock <= 0) {
    return { error: "Jumlah tebar benih harus berupa angka positif" };
  }

  const targetDays = targetDaysStr ? parseInt(targetDaysStr, 10) : 90;

  // Check if there is already an active cycle in this pond
  const { data: activeCycle } = await supabase
    .from("pond_cycles")
    .select("id")
    .eq("pond_id", pondId)
    .eq("status", "active")
    .maybeSingle();

  if (activeCycle) {
    return { error: "Kolam ini masih memiliki siklus budidaya yang aktif" };
  }

  const { error } = await supabase.from("pond_cycles").insert({
    pond_id: pondId,
    fish_type: fishType.trim(),
    initial_stock: stock,
    current_stock: stock,
    target_days: isNaN(targetDays) ? 90 : targetDays,
    status: "active",
    start_date: startDate || new Date().toISOString().split("T")[0],
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/ponds");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function recordHarvest(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const cycleId = formData.get("cycle_id") as string;
  const amountStr = formData.get("amount_harvested") as string;
  const weightStr = formData.get("weight_kg") as string;
  const harvestType = formData.get("harvest_type") as "partial" | "final";
  const notes = formData.get("notes") as string;

  if (!cycleId) return { error: "Siklus tidak valid" };
  if (!ownsCycle(user.id, cycleId)) return { error: "Siklus tidak ditemukan atau Anda tidak memiliki akses" };

  const amountHarvested = parseInt(amountStr, 10);
  if (isNaN(amountHarvested) || amountHarvested <= 0) {
    return { error: "Jumlah ekor panen harus berupa angka positif" };
  }

  const weightKg = weightStr ? parseFloat(weightStr) : null;

  // Fetch active cycle
  const { data: cycle, error: fetchErr } = await supabase
    .from("pond_cycles")
    .select("*")
    .eq("id", cycleId)
    .single();

  if (fetchErr || !cycle) return { error: "Siklus budidaya tidak ditemukan" };

  if (cycle.status !== "active") {
    return { error: "Siklus budidaya ini sudah selesai / dipanen" };
  }

  // Calculate new current stock
  if (amountHarvested > cycle.current_stock) return { error: "Jumlah panen melebihi stok ikan saat ini" };
  const newStock = Math.max(0, cycle.current_stock - amountHarvested);
  const isFinal = harvestType === "final" || newStock === 0;

  try {
    const saveHarvest = sqlite.transaction(() => {
      sqlite.prepare("INSERT INTO harvests (id, cycle_id, amount_harvested, weight_kg, harvest_type, harvest_date, notes) VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, ?)").run(cycleId, amountHarvested, weightKg, harvestType, new Date().toISOString(), notes?.trim() || null);
      sqlite.prepare("UPDATE pond_cycles SET current_stock = ?, status = ?, harvest_date = ? WHERE id = ? AND status = 'active'").run(isFinal ? 0 : newStock, isFinal ? "harvested" : "active", isFinal ? new Date().toISOString() : null, cycleId);
    });
    saveHarvest();
  } catch (error) { return { error: error instanceof Error ? error.message : "Gagal menyimpan panen" }; }

  revalidatePath("/dashboard/ponds");
  revalidatePath("/dashboard");
  return { success: true };
}
