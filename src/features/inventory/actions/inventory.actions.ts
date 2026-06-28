"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";

export async function createInventoryItem(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const farmId = formData.get("farm_id") as string;
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const stockStr = formData.get("stock_quantity") as string;
  const unit = formData.get("unit") as string;
  const unitPriceStr = formData.get("unit_price") as string;
  const minAlertStr = formData.get("min_stock_alert") as string;
  const description = formData.get("description") as string;

  if (!farmId) return { error: "Pilih lokasi farm/gudang terlebih dahulu" };
  if (!name || name.trim().length < 2) return { error: "Nama barang minimal 2 karakter" };
  if (!category) return { error: "Kategori barang wajib dipilih" };

  const stockQuantity = parseFloat(stockStr) || 0;
  const minStockAlert = parseFloat(minAlertStr) || 5;
  const unitPrice = unitPriceStr ? parseFloat(unitPriceStr) : 0;

  const { error } = await supabase.from("inventory_items").insert({
    user_id: user.id,
    farm_id: farmId,
    name: name.trim(),
    category: category.trim(),
    stock_quantity: Math.max(0, stockQuantity),
    unit: unit?.trim() || "kg",
    unit_price: Math.max(0, unitPrice),
    min_stock_alert: Math.max(0, minStockAlert),
    description: description?.trim() || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateStock(itemId: string, deltaAmount: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  // Fetch current item
  const { data: item, error: fetchErr } = await supabase
    .from("inventory_items")
    .select("stock_quantity")
    .eq("id", itemId)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !item) return { error: "Barang tidak ditemukan" };

  const newStock = Math.max(0, Number(item.stock_quantity) + deltaAmount);

  const { error } = await supabase
    .from("inventory_items")
    .update({ stock_quantity: newStock })
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
  return { success: true, newStock };
}

export async function deleteInventoryItem(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const { error } = await supabase
    .from("inventory_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
  return { success: true };
}
