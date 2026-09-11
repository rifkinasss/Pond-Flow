import { db } from "@/shared/lib/sqlite/db";
import type { Farm } from "@/shared/types/database.types";

export async function findFarmsForUser(userId: string): Promise<Farm[]> {
  const { data } = await db().from<Farm>("farms").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return data ?? [];
}

export async function countPondsByFarm(farmIds: string[]) {
  if (!farmIds.length) return {} as Record<string, number>;
  const { data } = await db().from<{ farm_id: string }>("ponds").select("farm_id").in("farm_id", farmIds);
  return (data ?? []).reduce<Record<string, number>>((counts, pond) => { counts[pond.farm_id] = (counts[pond.farm_id] ?? 0) + 1; return counts; }, {});
}
