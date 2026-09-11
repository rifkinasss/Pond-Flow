import { db } from "@/shared/lib/sqlite/db";
import type { InventoryItem } from "@/shared/types/database.types";

export async function findInventoryForUser(userId: string, filters?: { farmId?: string; category?: string }): Promise<InventoryItem[]> {
  let query = db().from<InventoryItem>("inventory_items").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (filters?.farmId) query = query.eq("farm_id", filters.farmId);
  if (filters?.category) query = query.eq("category", filters.category);
  const { data } = await query;
  return data ?? [];
}
