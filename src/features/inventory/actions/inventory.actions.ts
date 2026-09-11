"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/shared/lib/auth";
import { sqlite } from "@/shared/lib/sqlite/db";
import { ownsFarm, ownsInventoryItem } from "@/shared/lib/authorization";
import { randomUUID } from "node:crypto";

export async function createInventoryItem(formData: FormData) {
  const user = await getCurrentUser();

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
  if (!ownsFarm(user.id, farmId)) return { error: "Farm tidak ditemukan atau Anda tidak memiliki akses" };
  if (!name || name.trim().length < 2) return { error: "Nama barang minimal 2 karakter" };
  if (!category) return { error: "Kategori barang wajib dipilih" };

  const stockQuantity = parseFloat(stockStr) || 0;
  const minStockAlert = parseFloat(minAlertStr) || 5;
  const unitPrice = unitPriceStr ? parseFloat(unitPriceStr) : 0;

  try { sqlite.prepare("INSERT INTO inventory_items (id, user_id, farm_id, name, category, stock_quantity, unit, unit_price, min_stock_alert, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(randomUUID(), user.id, farmId, name.trim(), category.trim(), Math.max(0, stockQuantity), unit?.trim() || "kg", Math.max(0, unitPrice), Math.max(0, minStockAlert), description?.trim() || null); }
  catch (error) { return { error: error instanceof Error ? error.message : "Gagal menyimpan barang" }; }

  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateStock(itemId: string, deltaAmount: number) {
  const user = await getCurrentUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const item = sqlite.prepare("SELECT stock_quantity FROM inventory_items WHERE id = ? AND user_id = ?").get(itemId, user.id) as { stock_quantity: number } | undefined;
  if (!item) return { error: "Barang tidak ditemukan" };

  const newStock = Math.max(0, Number(item.stock_quantity) + deltaAmount);

  sqlite.prepare("UPDATE inventory_items SET stock_quantity = ? WHERE id = ? AND user_id = ?").run(newStock, itemId, user.id);

  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
  return { success: true, newStock };
}

export async function deleteInventoryItem(itemId: string) {
  const user = await getCurrentUser();

  if (!user) return { error: "Tidak terautentikasi" };

  if (!ownsInventoryItem(user.id, itemId)) return { error: "Barang tidak ditemukan atau Anda tidak memiliki akses" };
  sqlite.prepare("DELETE FROM inventory_items WHERE id = ? AND user_id = ?").run(itemId, user.id);

  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
  return { success: true };
}
