import type { Metadata } from "next";
import { createClient } from "@/shared/lib/supabase/server";
import { History, Wheat, Fish, Wallet, Rocket, Filter, MapPin, Clock } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";
import Link from "next/link";
import type { Farm, Pond, PondCycle } from "@/shared/types/database.types";

export const metadata: Metadata = { title: "Riwayat Aktivitas & Transaksi" };

interface PageProps {
  searchParams: Promise<{ farm?: string; type?: string }>;
}

export default async function HistoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedFarmId = params.farm;
  const selectedType = params.type;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Ambil Farms
  const { data: farmsData } = await supabase
    .from("farms")
    .select("id, name")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  const farms: Array<{ id: string; name: string }> = farmsData ?? [];
  const farmIds = farms.map((f) => f.id);

  // 2. Ambil Kolam
  let queryPonds = supabase.from("ponds").select("id, farm_id, name");
  if (farmIds.length > 0) {
    queryPonds = queryPonds.in("farm_id", farmIds);
  } else {
    queryPonds = queryPonds.eq("farm_id", "00000000-0000-0000-0000-000000000000");
  }
  if (selectedFarmId) {
    queryPonds = queryPonds.eq("farm_id", selectedFarmId);
  }
  const { data: pondsData } = await queryPonds;
  const ponds: Array<{ id: string; farm_id: string; name: string }> = pondsData ?? [];
  const pondIds = ponds.map((p) => p.id);

  // Maps for lookup
  const farmMap = new Map<string, string>(farms.map((f) => [f.id, f.name]));
  const pondMap = new Map<string, { id: string; farm_id: string; name: string }>(
    ponds.map((p) => [p.id, p])
  );

  // 3. Ambil Siklus
  let cycles: PondCycle[] = [];
  if (pondIds.length > 0) {
    const { data: cyclesData } = await supabase
      .from("pond_cycles")
      .select("*")
      .in("pond_id", pondIds);
    cycles = cyclesData ?? [];
  }
  const cycleIds = cycles.map((c) => c.id);
  const cycleMap = new Map<string, PondCycle>(cycles.map((c) => [c.id, c]));

  // Array koleksi seluruh aktivitas
  type ActivityEvent = {
    id: string;
    timestamp: Date;
    type: "feed" | "harvest" | "expense" | "cycle";
    title: string;
    locationInfo: string;
    badgeText: string;
    badgeStyle: string;
    amountDisplay?: string;
    details?: string;
  };

  const activities: ActivityEvent[] = [];

  // A. Fetch & Transform Feeding Logs (Pemberian Pakan)
  if (cycleIds.length > 0 && (!selectedType || selectedType === "feed")) {
    const { data: feedingData } = await supabase
      .from("feeding_logs")
      .select("*")
      .in("cycle_id", cycleIds);

    (feedingData ?? []).forEach((fl) => {
      const cycleObj = cycleMap.get(fl.cycle_id);
      const pondObj = cycleObj ? pondMap.get(cycleObj.pond_id) : null;
      const farmName = pondObj ? farmMap.get(pondObj.farm_id) : "";

      activities.push({
        id: `feed_${fl.id}`,
        timestamp: new Date(fl.feed_time || fl.created_at),
        type: "feed",
        title: `Pemberian Pakan ${fl.amount_kg} Kg`,
        locationInfo: pondObj ? `Kolam ${pondObj.name} ${farmName ? `(${farmName})` : ""}` : "Kolam",
        badgeText: "🌾 Pakan Harian",
        badgeStyle: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50",
        amountDisplay: fl.total_cost > 0 ? `Est. ${formatCurrency(fl.total_cost)}` : undefined,
        details: fl.notes || undefined,
      });
    });
  }

  // B. Fetch & Transform Harvests (Hasil Panen)
  if (cycleIds.length > 0 && (!selectedType || selectedType === "harvest")) {
    const { data: harvestData } = await supabase
      .from("harvests")
      .select("*")
      .in("cycle_id", cycleIds);

    (harvestData ?? []).forEach((h) => {
      const cycleObj = cycleMap.get(h.cycle_id);
      const pondObj = cycleObj ? pondMap.get(cycleObj.pond_id) : null;
      const farmName = pondObj ? farmMap.get(pondObj.farm_id) : "";

      activities.push({
        id: `harvest_${h.id}`,
        timestamp: new Date(h.harvest_date),
        type: "harvest",
        title: `Pencatatan Panen ${h.weight_kg ? `${h.weight_kg} Kg` : `${h.amount_harvested} Ekor`}`,
        locationInfo: pondObj ? `Kolam ${pondObj.name} ${farmName ? `(${farmName})` : ""}` : "Kolam",
        badgeText: h.harvest_type === "final" ? "🐟 Panen Final" : "🐟 Panen Parsial",
        badgeStyle: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50",
        details: h.notes || undefined,
      });
    });
  }

  // C. Fetch & Transform Expenses (Pengeluaran Operasional)
  if (!selectedType || selectedType === "expense") {
    let queryExp = supabase.from("expenses").select("*").eq("user_id", user.id);
    if (selectedFarmId) {
      queryExp = queryExp.eq("farm_id", selectedFarmId);
    }
    const { data: expenseData } = await queryExp;

    (expenseData ?? []).forEach((exp) => {
      const farmName = farmMap.get(exp.farm_id) || "";
      const pondObj = exp.pond_id ? pondMap.get(exp.pond_id) : null;

      activities.push({
        id: `expense_${exp.id}`,
        timestamp: new Date(exp.expense_date || exp.created_at),
        type: "expense",
        title: `Pengeluaran ${exp.category}`,
        locationInfo: `${farmName} ${pondObj ? `• Kolam ${pondObj.name}` : ""}`,
        badgeText: `💰 ${exp.category}`,
        badgeStyle: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50",
        amountDisplay: formatCurrency(exp.amount),
        details: exp.description || undefined,
      });
    });
  }

  // D. Transform Cycles (Tebar Benih Baru)
  if (!selectedType || selectedType === "cycle") {
    cycles.forEach((c) => {
      const pondObj = pondMap.get(c.pond_id);
      const farmName = pondObj ? farmMap.get(pondObj.farm_id) : "";

      activities.push({
        id: `cycle_${c.id}`,
        timestamp: new Date(c.start_date || c.created_at),
        type: "cycle",
        title: `Tebar Benih ${c.fish_type} (${c.initial_stock.toLocaleString("id-ID")} Ekor)`,
        locationInfo: pondObj ? `Kolam ${pondObj.name} ${farmName ? `(${farmName})` : ""}` : "Kolam",
        badgeText: "🚀 Tebar Benih",
        badgeStyle: "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/50",
        details: `Target Pemeliharaan: ${c.target_days || 90} Hari`,
      });
    });
  }

  // Urutkan seluruh aktivitas dari yang paling baru
  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <History size={24} className="text-sky-500" />
            Riwayat Aktivitas & Transaksi
          </h1>
          <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
            Catatan kronologis lengkap atas pakan harian, panen, pengeluaran, dan tebar benih
          </p>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-200">
            <Filter size={14} className="text-sky-500" />
            Filter Lokasi Farm:
          </div>

          {/* Farm Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <Link
              href={`/dashboard/history${selectedType ? `?type=${selectedType}` : ""}`}
              className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                !selectedFarmId ? "bg-sky-600 text-white" : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              Semua Farm
            </Link>
            {farms.map((f) => (
              <Link
                key={f.id}
                href={`/dashboard/history?farm=${f.id}${selectedType ? `&type=${selectedType}` : ""}`}
                className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 ${
                  selectedFarmId === f.id ? "bg-sky-600 text-white" : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                }`}
              >
                <MapPin size={11} />
                {f.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="h-px bg-gray-100 dark:bg-slate-800 w-full" />

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          <Link
            href={`/dashboard/history${selectedFarmId ? `?farm=${selectedFarmId}` : ""}`}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
              !selectedType
                ? "bg-sky-600 text-white shadow-sm shadow-sky-200 dark:shadow-none"
                : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-800"
            }`}
          >
            Semua Aktivitas
          </Link>
          {[
            { id: "feed", name: "Pemberian Pakan", icon: "🌾" },
            { id: "harvest", name: "Pencatatan Panen", icon: "🐟" },
            { id: "expense", name: "Pengeluaran Biaya", icon: "💰" },
            { id: "cycle", name: "Tebar Benih Siklus", icon: "🚀" },
          ].map((cat) => (
            <Link
              key={cat.id}
              href={`/dashboard/history?type=${cat.id}${selectedFarmId ? `&farm=${selectedFarmId}` : ""}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 border ${
                selectedCategoryMatch(selectedType, cat.id)
                  ? "bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-200 dark:shadow-none"
                  : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border-gray-100 dark:border-slate-800"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Timeline Activity List ── */}
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center mb-4">
            <History size={28} className="text-sky-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Belum ada riwayat aktivitas</h3>
          <p className="text-sm text-muted-foreground dark:text-slate-400 mt-2 max-w-xs">
            {selectedType || selectedFarmId
              ? "Tidak ada riwayat aktivitas yang sesuai dengan filter ini."
              : "Aktivitas tebar benih, pemberian pakan, panen, dan pengeluaran akan otomatis tercatat di sini."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((act) => (
            <div
              key={act.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center shrink-0 text-xl shadow-xs border border-sky-100/50 dark:border-sky-800/50">
                  {act.type === "feed" ? "🌾" : act.type === "harvest" ? "🐟" : act.type === "expense" ? "💰" : "🚀"}
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-md border ${act.badgeStyle}`}>
                      {act.badgeText}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-gray-100 dark:border-slate-700">
                      <MapPin size={11} className="text-sky-500 dark:text-sky-400" />
                      {act.locationInfo}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                    {act.title}
                  </p>

                  {act.details && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 italic">
                      {act.details}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 pt-0.5">
                    <Clock size={12} />
                    <span>
                      {act.timestamp.toLocaleString("id-ID", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {act.amountDisplay && (
                <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50 dark:border-slate-800 shrink-0">
                  <p className="text-xs text-muted-foreground dark:text-slate-400 font-medium">Nominal / Budget</p>
                  <p className="text-base font-extrabold text-gray-900 dark:text-white">
                    {act.amountDisplay}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function selectedCategoryMatch(selectedType?: string, catId?: string) {
  return selectedType === catId;
}
