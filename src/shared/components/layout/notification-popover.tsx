"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, AlertTriangle, Wheat, Award, Clock, CheckCheck, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getSystemNotifications, type SystemNotification } from "@/shared/actions/notification.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getNotificationPermissionStatus, requestNotificationPermission, triggerNotification } from "@/shared/lib/notifications";

export function NotificationPopover() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [permissionStatus, setPermissionStatus] = useState<"granted" | "denied" | "default">("default");

  const checkPermission = async () => {
    const status = await getNotificationPermissionStatus();
    setPermissionStatus(status);
  };

  const loadNotifications = () => {
    startTransition(async () => {
      const data = await getSystemNotifications();
      setNotifications(data.notifications);

      // Filter unread notifications using localStorage read IDs
      const storedRead = localStorage.getItem("pondflow_read_notification_ids");
      const readIdsList: string[] = storedRead ? JSON.parse(storedRead) : [];
      setReadIds(readIdsList);

      const unreadCountFiltered = data.notifications.filter(
        (n) => !readIdsList.includes(n.id)
      ).length;
      setUnreadCount(unreadCountFiltered);

      // Trigger local/push notification for new entries
      if (data.notifications.length > 0) {
        const storedNotified = localStorage.getItem("pondflow_notified_ids");
        if (storedNotified === null) {
          // First run: register active notification IDs to prevent spamming
          const initialIds = data.notifications.map((n) => n.id);
          localStorage.setItem("pondflow_notified_ids", JSON.stringify(initialIds));
        } else {
          try {
            const notifiedIds: string[] = JSON.parse(storedNotified);
            const newNotifiedIds = [...notifiedIds];
            let hasNew = false;

            for (const item of data.notifications) {
              if (!notifiedIds.includes(item.id)) {
                await triggerNotification(item.title, item.message, item.href);
                newNotifiedIds.push(item.id);
                hasNew = true;
              }
            }

            if (hasNew) {
              // Keep only the last 50 notification IDs to prevent localStorage bloat
              const keptIds = newNotifiedIds.slice(-50);
              localStorage.setItem("pondflow_notified_ids", JSON.stringify(keptIds));
            }
          } catch (e) {
            console.error("Gagal memproses riwayat notifikasi lokal:", e);
          }
        }
      }
    });
  };

  useEffect(() => {
    loadNotifications();
    checkPermission();
    // Refresh notifications every 60 seconds
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(granted ? "granted" : "denied");
  };

  const handleMarkAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    localStorage.setItem("pondflow_read_notification_ids", JSON.stringify(allIds));
    setReadIds(allIds);
    setUnreadCount(0);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        onClick={loadNotifications}
        className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors outline-none"
        title="Notifikasi & Peringatan System"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse border-2 border-white shadow-xs">
            {unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 p-0 rounded-2xl bg-white/95 backdrop-blur-xl border border-gray-100 shadow-2xl shadow-sky-900/10 overflow-hidden z-50 mt-2"
      >
        {/* Header Dropdown */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-sky-50/50 to-cyan-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center text-white shadow-xs">
              <Bell size={14} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-none">Pusat Notifikasi</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {unreadCount > 0 ? `${unreadCount} peringatan penting` : "Semua sistem terpantau aman"}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 bg-sky-50 px-2 py-1 rounded-lg transition-colors"
            >
              <CheckCheck size={12} />
              Tandai Dibaca
            </button>
          )}
        </div>

        {/* Permission CTA Banner */}
        {permissionStatus !== "granted" && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-gray-800/80 flex items-center justify-between gap-3 transition-colors">
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-snug flex-1">
              Aktifkan notifikasi untuk menerima peringatan stok dan panen langsung di HP/desktop Anda.
            </p>
            <button
              onClick={handleRequestPermission}
              className="text-[10px] font-bold text-white bg-sky-500 hover:bg-sky-600 px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              Aktifkan
            </button>
          </div>
        )}

        {/* Content List */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
          {notifications.length === 0 ? (
            <div className="py-10 text-center px-4 space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto text-xl">
                ✨
              </div>
              <p className="text-sm font-semibold text-gray-800">Tidak ada peringatan baru</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Stok inventori aman, dan pemberian pakan harian berjalan lancar.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const isRead = readIds.includes(n.id);
              return (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => setIsOpen(false)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-sky-50/50 transition-colors group ${isRead ? "opacity-60" : ""}`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base shadow-xs ${
                      n.type === "warning"
                        ? "bg-amber-50 text-amber-600 border border-amber-100"
                        : n.type === "feed"
                          ? "bg-amber-50 text-amber-600 border border-amber-100"
                          : n.type === "success"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-sky-50 text-sky-600 border border-sky-100"
                    }`}
                  >
                    {n.type === "warning" ? (
                      <AlertTriangle size={17} />
                    ) : n.type === "feed" ? (
                      <Wheat size={17} />
                    ) : n.type === "success" ? (
                      <Award size={17} />
                    ) : (
                      <Clock size={17} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-900 leading-snug group-hover:text-sky-600 transition-colors">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0 font-medium">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                  </div>

                  <ChevronRight size={14} className="text-gray-300 group-hover:text-sky-500 self-center shrink-0 transition-colors" />
                </Link>
              );
            })
          )}
        </div>

        {/* Footer Dropdown */}
        <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-center">
          <Link
            href="/dashboard/history"
            onClick={() => setIsOpen(false)}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1 transition-colors"
          >
            Lihat Semua Riwayat Aktivitas &rarr;
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
