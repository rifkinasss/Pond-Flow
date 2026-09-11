"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/app/server";
import { ownsCycle, ownsInventoryItem } from "@/shared/lib/authorization";
import { sqlite } from "@/shared/lib/sqlite/db";

export async function recordFeeding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const cycleId = formData.get("cycle_id") as string;
  const inventoryItemId = formData.get("inventory_item_id") as string;
  const feedTime = formData.get("feed_time") as string;
  const amountKgStr = formData.get("amount_kg") as string;
  const unitPriceStr = formData.get("unit_price") as string;
  const notes = formData.get("notes") as string;

  if (!cycleId) return { error: "Siklus kolam tidak valid" };
  if (!ownsCycle(user.id, cycleId)) return { error: "Siklus tidak ditemukan atau Anda tidak memiliki akses" };

  const amountKg = parseFloat(amountKgStr);
  if (isNaN(amountKg) || amountKg <= 0) {
    return { error: "Jumlah pakan (kg) harus berupa angka positif" };
  }

  const unitPrice = unitPriceStr ? parseFloat(unitPriceStr) : 0;
  const totalCost = amountKg * unitPrice;

  if (inventoryItemId && inventoryItemId !== "none" && !ownsInventoryItem(user.id, inventoryItemId)) return { error: "Barang inventori tidak ditemukan atau Anda tidak memiliki akses" };

  try {
    const saveFeeding = sqlite.transaction(() => {
      if (inventoryItemId && inventoryItemId !== "none") {
        const item = sqlite.prepare("SELECT stock_quantity FROM inventory_items WHERE id = ? AND user_id = ?").get(inventoryItemId, user.id) as { stock_quantity: number } | undefined;
        if (!item) throw new Error("Barang inventori tidak ditemukan");
        sqlite.prepare("UPDATE inventory_items SET stock_quantity = MAX(0, stock_quantity - ?) WHERE id = ? AND user_id = ?").run(amountKg, inventoryItemId, user.id);
      }
      sqlite.prepare("INSERT INTO feeding_logs (id, cycle_id, inventory_item_id, feed_time, amount_kg, unit_price, total_cost, notes) VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, ?, ?)").run(cycleId, inventoryItemId && inventoryItemId !== "none" ? inventoryItemId : null, feedTime || new Date().toISOString(), amountKg, unitPrice, totalCost, notes?.trim() || null);
    });
    saveFeeding();
  } catch (error) { return { error: error instanceof Error ? error.message : "Gagal menyimpan catatan pakan" }; }

  revalidatePath("/dashboard/ponds");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/finance/expenses");
  revalidatePath("/dashboard");
  return { success: true, totalCost };
}
