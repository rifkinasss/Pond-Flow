import type { Metadata } from "next";
import { createClient } from "@/shared/lib/supabase/server";
import { IotDeviceClientPage } from "./IotDeviceClientPage";
import type { Pond, PondCycle } from "@/shared/types/database.types";

export const metadata: Metadata = { title: "IoT Auto-Feeder & Dispenser Cerdas" };

export default async function IotDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch Farms
  const { data: farmsData } = await supabase
    .from("farms")
    .select("id, name")
    .eq("user_id", user.id);
  const farmIds = (farmsData ?? []).map((f) => f.id);

  // Fetch Ponds
  let ponds: Pond[] = [];
  if (farmIds.length > 0) {
    const { data: pondsData } = await supabase
      .from("ponds")
      .select("*")
      .in("farm_id", farmIds);
    ponds = pondsData ?? [];
  }

  // Fetch Active Cycles
  const pondIds = ponds.map((p) => p.id);
  let activeCycles: PondCycle[] = [];
  if (pondIds.length > 0) {
    const { data: cyclesData } = await supabase
      .from("pond_cycles")
      .select("*")
      .in("pond_id", pondIds)
      .eq("status", "active");
    activeCycles = cyclesData ?? [];
  }

  // Fetch Initial IoT Devices
  const { data: devicesData } = await supabase
    .from("iot_devices")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const pondMap = new Map<string, string>(ponds.map((p) => [p.id, p.name]));
  const initialDevices = (devicesData ?? []).map((d: any) => ({
    id: d.id,
    pond_id: d.pond_id,
    pond_name: pondMap.get(d.pond_id) || "Kolam",
    device_code: d.device_code,
    status: d.status || "online",
    battery_level: d.battery_level ?? 100,
    hopper_level: d.hopper_level ?? 100,
    daily_dispensed_kg: 0,
  }));

  return (
    <IotDeviceClientPage
      initialDevices={initialDevices}
      ponds={ponds.map((p) => ({ id: p.id, name: p.name }))}
      cycles={activeCycles}
    />
  );
}
