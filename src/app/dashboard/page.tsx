import type { Metadata } from "next";
import { createClient } from "@/shared/lib/supabase/server";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch Farms
  const { data: farms, count: farmCount } = await supabase
    .from("farms")
    .select("id, name, address, latitude, longitude", { count: "exact" })
    .eq("user_id", user.id);

  const farmIds = (farms ?? []).map((f) => f.id);

  let totalPondsCount = 0;
  let activePondsCount = 0;
  let monthlyExpenses = 0;
  let monthlyRevenue = 0;

  const now = new Date();
  const startOfMonthStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

  if (farmIds.length > 0) {
    // Fetch Ponds count
    const { data: pondsData } = await supabase
      .from("ponds")
      .select("id")
      .in("farm_id", farmIds);

    const pondIds = (pondsData ?? []).map((p) => p.id);
    totalPondsCount = pondIds.length;

    // Fetch Active Ponds (Active Cycles)
    if (pondIds.length > 0) {
      const { count: activeCount } = await supabase
        .from("pond_cycles")
        .select("id", { count: "exact" })
        .in("pond_id", pondIds)
        .eq("status", "active");

      activePondsCount = activeCount ?? 0;
    }

    // Monthly Expenses
    const { data: expData } = await supabase
      .from("expenses")
      .select("amount")
      .in("farm_id", farmIds)
      .gte("expense_date", startOfMonthStr);

    monthlyExpenses = (expData ?? []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    // Monthly Revenue from Harvests
    if (pondIds.length > 0) {
      const { data: cyclesData } = await supabase
        .from("pond_cycles")
        .select("id")
        .in("pond_id", pondIds);

      const cIds = (cyclesData ?? []).map((c) => c.id);
      if (cIds.length > 0) {
        const { data: harvestData } = await supabase
          .from("harvests")
          .select("weight_kg")
          .in("cycle_id", cIds)
          .gte("harvest_date", startOfMonthStr);

        const harvestKg = (harvestData ?? []).reduce((acc, curr) => acc + Number(curr.weight_kg || 0), 0);
        monthlyRevenue = harvestKg * 23000;
      }
    }
  }

  const displayName =
    user?.user_metadata?.display_name ??
    user?.email?.split("@")[0] ??
    "Pengguna";

  const greeting =
    now.getHours() < 11
      ? "Selamat pagi"
      : now.getHours() < 15
        ? "Selamat siang"
        : now.getHours() < 18
          ? "Selamat sore"
          : "Selamat malam";

  const dateStr = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <DashboardClient
      displayName={displayName}
      greeting={greeting}
      dateStr={dateStr}
      farmCount={farmCount ?? 0}
      totalPondsCount={totalPondsCount}
      activePondsCount={activePondsCount}
      monthlyExpenses={monthlyExpenses}
      monthlyRevenue={monthlyRevenue}
      farms={farms ?? []}
    />
  );
}
