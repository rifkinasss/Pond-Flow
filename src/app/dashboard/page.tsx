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

  // Generate chart data array for the last 6 months (initialized with 0)
  const chartData: { monthIndex: number; year: number; expense: number; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    chartData.push({
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
      expense: 0,
      revenue: 0,
    });
  }

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

  // 12-month / Calendar year calculations for filter support
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const earliestStartDate = startOfYear < twelveMonthsAgo ? startOfYear : twelveMonthsAgo;
  const earliestStartDateStr = earliestStartDate.toISOString().split("T")[0];

  let historicalExpenses: any[] = [];
  let historicalHarvests: any[] = [];

  if (farmIds.length > 0) {
    const { data: expData } = await supabase
      .from("expenses")
      .select("amount, expense_date")
      .in("farm_id", farmIds)
      .gte("expense_date", earliestStartDateStr);
    historicalExpenses = expData ?? [];

    if (totalPondsCount > 0) {
      const { data: pondsData } = await supabase
        .from("ponds")
        .select("id")
        .in("farm_id", farmIds);

      const pIds = (pondsData ?? []).map((p) => p.id);
      if (pIds.length > 0) {
        const { data: cyclesData } = await supabase
          .from("pond_cycles")
          .select("id")
          .in("pond_id", pIds);

        const cIds = (cyclesData ?? []).map((c) => c.id);
        if (cIds.length > 0) {
          const { data: harvestsData } = await supabase
            .from("harvests")
            .select("weight_kg, harvest_date")
            .in("cycle_id", cIds)
            .gte("harvest_date", earliestStartDateStr);
          historicalHarvests = harvestsData ?? [];
        }
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
      expenses={historicalExpenses}
      harvests={historicalHarvests}
    />
  );
}
