import { Capacitor } from "@capacitor/core";

/**
 * Mendapatkan status izin notifikasi saat ini.
 * Mengembalikan "granted", "denied", atau "default".
 */
export async function getNotificationPermissionStatus(): Promise<"granted" | "denied" | "default"> {
  if (typeof window === "undefined") return "default";

  if (Capacitor.isNativePlatform()) {
    try {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display === "granted") return "granted";
      if (perm.display === "denied") return "denied";
      return "default";
    } catch (e) {
      console.error("Gagal memeriksa izin notifikasi Capacitor:", e);
      return "default";
    }
  } else if ("Notification" in window) {
    return Notification.permission;
  }
  return "default";
}

/**
 * Meminta izin notifikasi dari pengguna.
 * Mengembalikan true jika izin diberikan (granted).
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  if (Capacitor.isNativePlatform()) {
    try {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      const req = await LocalNotifications.requestPermissions();
      return req.display === "granted";
    } catch (e) {
      console.error("Gagal meminta izin notifikasi Capacitor:", e);
      return false;
    }
  } else if ("Notification" in window) {
    if (Notification.permission === "granted") return true;
    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
  }
  return false;
}

/**
 * Menayangkan notifikasi lokal ke sistem pengguna.
 */
export async function triggerNotification(title: string, body: string, href?: string) {
  if (typeof window === "undefined") return;

  if (Capacitor.isNativePlatform()) {
    try {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      
      // Schedule local notification on mobile
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Math.floor(Math.random() * 1000000),
            schedule: { at: new Date(Date.now() + 500) },
            extra: { href }
          }
        ]
      });
    } catch (e) {
      console.error("Gagal menayangkan notifikasi lokal di mobile:", e);
    }
  } else if ("Notification" in window && Notification.permission === "granted") {
    try {
      const n = new Notification(title, {
        body,
        icon: "/icons/icon-192.png",
      });

      if (href) {
        n.onclick = (e) => {
          e.preventDefault();
          window.focus();
          window.location.href = href;
        };
      }
    } catch (e) {
      console.error("Gagal menayangkan notifikasi browser:", e);
    }
  }
}
