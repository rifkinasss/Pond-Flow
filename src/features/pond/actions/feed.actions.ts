"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";

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

  const amountKg = parseFloat(amountKgStr);
  if (isNaN(amountKg) || amountKg <= 0) {
    return { error: "Jumlah pakan (kg) harus berupa angka positif" };
  }

  const unitPrice = unitPriceStr ? parseFloat(unitPriceStr) : 0;
  const totalCost = amountKg * unitPrice;

  // Insert feeding log
  const { error: insertErr } = await supabase.from("feeding_logs").insert({
    cycle_id: cycleId,
    inventory_item_id: inventoryItemId && inventoryItemId !== "none" ? inventoryItemId : null,
    feed_time: feedTime || new Date().toISOString(),
    amount_kg: amountKg,
    unit_price: unitPrice,
    total_cost: totalCost,
    notes: notes?.trim() || null,
  });

  if (insertErr) return { error: insertErr.message };

  // Automatically deduct stock from inventory if inventory item selected!
  if (inventoryItemId && inventoryItemId !== "none") {
    const { data: item } = await supabase
      .from("inventory_items")
      .select("stock_quantity")
      .eq("id", inventoryItemId)
      .single();

    if (item) {
      const newStock = Math.max(0, Number(item.stock_quantity) - amountKg);
      await supabase
        .from("inventory_items")
        .update({ stock_quantity: newStock })
        .eq("id", inventoryItemId);
    }
  }

  revalidatePath("/dashboard/ponds");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/finance/expenses");
  revalidatePath("/dashboard");
  return { success: true, totalCost };
}
