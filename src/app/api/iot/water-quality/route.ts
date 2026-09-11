import { NextResponse } from "next/server";
import { getCurrentUser } from "@/shared/lib/auth";
import { db } from "@/shared/lib/sqlite/db";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const ids = new URL(request.url).searchParams.getAll("pond_id");
  const database = db();
  const { data: farms } = await database.from<{ id: string }>("farms").select("id").eq("user_id", user.id);
  const farmIds = (farms ?? []).map((farm) => farm.id);
  const { data: ponds } = await database.from<{ id: string }>("ponds").select("id").in("farm_id", farmIds);
  const ownedIds = new Set((ponds ?? []).map((pond) => pond.id));
  const requestedIds = ids.length ? ids.filter((id) => ownedIds.has(id)) : [...ownedIds];
  const { data } = await database.from("water_quality_readings").select("*").in("pond_id", requestedIds).order("recorded_at", { ascending: false });
  const latest = new Map<string, any>();
  for (const row of data ?? []) if (!latest.has(row.pond_id)) latest.set(row.pond_id, row);
  return NextResponse.json({ readings: [...latest.values()] });
}
