"use server";

import { createClient } from "@/shared/lib/supabase/server";

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: "warning" | "info" | "success" | "feed";
  timestamp: string;
  href: string;
  read?: boolean;
}

export async function getSystemNotifications(): Promise<{
  notifications: SystemNotification[];
  unreadCount: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { notifications: [], unreadCount: 0 };

  const notifications: SystemNotification[] = [];

  // 1. Check Low Stock Inventory Items
  const { data: inventoryItems } = await supabase
    .from("inventory_items")
    .select("id, name, stock_quantity, min_stock_alert, unit")
    .eq("user_id", user.id);

  (inventoryItems ?? []).forEach((item) => {
    if (item.stock_quantity <= item.min_stock_alert) {
      notifications.push({
        id: `stock_${item.id}`,
        title: item.stock_quantity === 0 ? "🔴 Stok Habis!" : "⚠️ Stok Menipis!",
        message: `${item.name} tersisa ${item.stock_quantity} ${item.unit} (Batas min: ${item.min_stock_alert} ${item.unit})`,
        type: "warning",
        timestamp: "Saat ini",
        href: "/dashboard/inventory",
      });
    }
  });

  // 2. Check Farms & Ponds
  const { data: farms } = await supabase
    .from("farms")
    .select("id")
    .eq("user_id", user.id);

  const farmIds = (farms ?? []).map((f) => f.id);

  if (farmIds.length > 0) {
    const { data: ponds } = await supabase
      .from("ponds")
      .select("id, name")
      .in("farm_id", farmIds);

    const pondIds = (ponds ?? []).map((p) => p.id);
    const pondMap = new Map<string, string>((ponds ?? []).map((p) => [p.id, p.name]));

    if (pondIds.length > 0) {
      // Check Active Cycles for Harvest Target Milestones & Daily Feeding
      const { data: activeCycles } = await supabase
        .from("pond_cycles")
        .select("*")
        .in("pond_id", pondIds)
        .eq("status", "active");

      const now = new Date();

      for (const cycle of activeCycles ?? []) {
        const pondName = pondMap.get(cycle.pond_id) || "Kolam";
        const startDate = new Date(cycle.start_date);
        const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
        const targetDays = cycle.target_days || 90;

        // Target Harvest Alert
        if (diffDays >= targetDays) {
          notifications.push({
            id: `harvest_${cycle.id}`,
            title: "🏁 Target Panen Tercapai!",
            message: `Siklus ${cycle.fish_type} di Kolam ${pondName} sudah mencapai hari ke-${diffDays} (Target ${targetDays} hari).`,
            type: "success",
            timestamp: "Hari ini",
            href: "/dashboard/ponds",
          });
        } else if (diffDays >= targetDays - 5) {
          notifications.push({
            id: `harvest_soon_${cycle.id}`,
            title: "⏱️ Mendekati Target Panen",
            message: `Kolam ${pondName} memasuki hari ke-${diffDays} dari target ${targetDays} hari pemeliharaan.`,
            type: "info",
            timestamp: "Hari ini",
            href: "/dashboard/ponds",
          });
        }

        // Daily Feeding Reminder Check
        const todayStr = now.toISOString().split("T")[0];
        const { data: todayFeeds } = await supabase
          .from("feeding_logs")
          .select("id")
          .eq("cycle_id", cycle.id)
          .gte("feed_time", `${todayStr}T00:00:00`);

        if (!todayFeeds || todayFeeds.length === 0) {
          notifications.push({
            id: `feed_remind_${cycle.id}`,
            title: "🌾 Pengingat Beri Pakan",
            message: `Kolam ${pondName} (${cycle.fish_type}) belum ada catatan pakan hari ini.`,
            type: "feed",
            timestamp: "Hari ini",
            href: "/dashboard/ponds",
          });
        }
      }
    }
  }

  return {
    notifications,
    unreadCount: notifications.length,
  };
}
