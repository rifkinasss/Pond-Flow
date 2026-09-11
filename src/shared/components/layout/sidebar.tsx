"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  BarChart3,
  ChevronRight,
  Cpu,
  Fish,
  History,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  Search,
  Settings,
  ShieldCheck,
  Users,
  MonitorCog,
  Wallet,
  X,
} from "lucide-react";

import { LanguageToggle } from "@/shared/components/layout/language-toggle";
import { NotificationPopover } from "@/shared/components/layout/notification-popover";
import { ThemeToggle } from "@/shared/components/layout/theme-toggle";
import { UserAvatarButton } from "@/shared/components/layout/user-avatar-button";
import { cn } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/store/app.store";

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/farms", label: "Farms", icon: MapPin },
  { href: "/dashboard/ponds", label: "Ponds", icon: Fish },
  { href: "/dashboard/finance/expenses", label: "Expenses", icon: Wallet },
  { href: "/dashboard/inventory", label: "Inventory", icon: Package },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/iot", label: "IoT Monitoring", icon: Cpu },
];

const adminNavItems = [
  { href: "/dashboard/admin", label: "Overview", icon: ShieldCheck },
  { href: "/dashboard/admin/users", label: "User management", icon: Users },
  { href: "/dashboard/admin/monitoring", label: "Monitoring", icon: MonitorCog },
  { href: "/dashboard/admin/settings", label: "System settings", icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const [isPending, startTransition] = useTransition();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 768 && sidebarOpen) toggleSidebar();
  // The initial value is optimized for desktop; normalize it for mobile once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        const role = body?.user?.role;
        setIsAdmin(role === "admin" || role === "superadmin");
      })
      .catch(() => setIsAdmin(false));
  }, []);

  const closeOnMobile = () => {
    if (window.innerWidth < 768) toggleSidebar();
  };

  const handleLogout = () => {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <>
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-slate-950/30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[276px] flex-col border-r border-slate-200 bg-white text-slate-700 shadow-xl transition-transform duration-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 md:static md:z-auto md:shadow-none",
          !sidebarOpen && "-translate-x-full md:w-[76px] md:translate-x-0",
        )}
      >
        <div className="flex h-[84px] shrink-0 items-center gap-3 border-b border-slate-200 px-5 dark:border-slate-800">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700 ring-1 ring-sky-100 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-900">
            <Fish className="h-5 w-5" />
          </div>
          <div className={cn("min-w-0", !sidebarOpen && "md:hidden")}>
            <p className="truncate text-[15px] font-bold text-slate-900 dark:text-white">PondFlow</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">NasLabs aquaculture</p>
          </div>
          <button className="ml-auto rounded-lg p-1 text-slate-500 hover:bg-slate-100 md:hidden dark:hover:bg-slate-800" onClick={toggleSidebar} aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          <div>
            <p className={cn("mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400", !sidebarOpen && "md:hidden")}>Menu utama</p>
            <div className="space-y-1">
              {mainNavItems.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeOnMobile}
                    title={item.label}
                    className={cn(
                      "group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                      active ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white",
                      !sidebarOpen && "md:justify-center md:px-0",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    <span className={cn(!sidebarOpen && "md:hidden")}>{item.label}</span>
                    <ChevronRight className={cn("ml-auto h-4 w-4 opacity-0 transition-opacity", active ? "opacity-80" : "group-hover:opacity-60", !sidebarOpen && "md:hidden")} />
                  </Link>
                );
              })}
            </div>
          </div>

          {isAdmin && (
            <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
              <p className={cn("mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400", !sidebarOpen && "md:hidden")}>Admin</p>
              <div className="space-y-1">{adminNavItems.map((item) => { const active = item.href === "/dashboard/admin" ? pathname === item.href : pathname.startsWith(item.href); const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={closeOnMobile} title={item.label} className={cn("group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors", active ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white", !sidebarOpen && "md:justify-center md:px-0")}><Icon className="h-[18px] w-[18px] shrink-0" /><span className={cn(!sidebarOpen && "md:hidden")}>{item.label}</span><ChevronRight className={cn("ml-auto h-4 w-4 opacity-0 transition-opacity", active ? "opacity-80" : "group-hover:opacity-60", !sidebarOpen && "md:hidden")} /></Link>; })}</div>
            </div>
          )}
        </nav>

        <div className="shrink-0 p-3">
          <button disabled={isPending} onClick={handleLogout} className={cn("flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30", !sidebarOpen && "md:justify-center md:px-0")} title="Logout">
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            <span className={cn(!sidebarOpen && "md:hidden")}>{isPending ? "Logging out…" : "Logout"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export function Navbar() {
  const { toggleSidebar } = useAppStore();
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950 md:px-6">
      <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900" onClick={toggleSidebar} aria-label="Toggle sidebar"><Menu className="h-5 w-5" /></button>
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900" placeholder="Search PondFlow…" />
      </div>
      <div className="ml-auto flex items-center gap-1"><LanguageToggle /><ThemeToggle /><NotificationPopover /><UserAvatarButton /></div>
    </header>
  );
}
