"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransitionRouter } from "@/shared/hooks/useTransitionRouter";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Fish,
  Wallet,
  Package,
  BarChart3,
  LogOut,
  Menu,
  X,
  MapPin,
  ChevronRight,
  Bell,
  Search,
  History,
  UserCog,
  Cpu,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/store/app.store";
import { createClient } from "@/shared/lib/supabase/client";
import { useTranslation } from "@/shared/i18n/LanguageContext";

export function Sidebar() {
  const pathname = usePathname();
  const router = useTransitionRouter();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { t } = useTranslation();

  const navItems = [
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/dashboard/farms", label: t.nav.farms, icon: MapPin },
    { href: "/dashboard/ponds", label: t.nav.ponds, icon: Fish },
    { href: "/dashboard/finance/expenses", label: t.nav.expenses, icon: Wallet },
    { href: "/dashboard/inventory", label: t.nav.inventory, icon: Package },
    { href: "/dashboard/reports", label: t.nav.reports, icon: BarChart3 },
    { href: "/dashboard/history", label: t.nav.history, icon: History },
    { href: "/dashboard/iot", label: t.nav.iot, icon: Cpu },
    { href: "/dashboard/profile", label: t.nav.profile, icon: UserCog },
  ];

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Berhasil keluar");
    router.push("/login");
  };

  const handleNavClick = () => {
    // Only close drawer on mobile screens (< 1024px)
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-full flex flex-col transition-all duration-300 shrink-0 select-none",
          "bg-gray-950 border-r border-gray-800",
          "lg:static lg:z-auto",
          sidebarOpen
            ? "w-64 translate-x-0 opacity-100"
            : "-translate-x-full w-64 lg:w-20 lg:translate-x-0 lg:opacity-100"
        )}
      >
        {/* Logo */}
        <div className={cn("flex items-center justify-between h-16 border-b border-gray-800 transition-all duration-300", sidebarOpen ? "px-5" : "px-5 lg:px-4 lg:justify-center")}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-900/50 shrink-0 overflow-hidden border border-sky-400/30">
              <img src="/logo.png" alt="PondFlow Logo" className="w-full h-full object-cover" />
            </div>
            <span className={cn("font-bold text-lg text-white tracking-tight whitespace-nowrap transition-all duration-200", !sidebarOpen && "lg:hidden")}>
              Pond<span className="text-sky-400">Flow</span>
            </span>
          </div>
          <button
            className="lg:hidden text-gray-500 hover:text-gray-300 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Label */}
        <div className={cn("px-5 pt-5 pb-2 transition-all duration-200", !sidebarOpen && "lg:hidden")}>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
            Menu Utama
          </p>
        </div>

        {/* Nav */}
        <nav className={cn("flex-1 overflow-y-auto px-3 transition-all duration-300", !sidebarOpen && "lg:px-2 pt-4")}>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={true}
                    onClick={handleNavClick}
                    title={!sidebarOpen ? item.label : undefined}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                      !sidebarOpen && "lg:justify-center lg:px-0 lg:h-11",
                      isActive
                        ? "bg-sky-500/15 text-sky-400 shadow-sm"
                        : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                    )}
                  >
                    <Icon
                      size={18}
                      className={cn(
                        "shrink-0 transition-colors",
                        isActive ? "text-sky-400" : "text-gray-500 group-hover:text-gray-300"
                      )}
                    />
                    <span className={cn("flex-1 whitespace-nowrap transition-all duration-200", !sidebarOpen && "lg:hidden")}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className={cn("w-1.5 h-1.5 rounded-full bg-sky-400", !sidebarOpen && "lg:hidden")} />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800 space-y-1">
          <button
            onClick={handleSignOut}
            title={!sidebarOpen ? t.nav.logout : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150",
              !sidebarOpen && "lg:justify-center lg:px-0"
            )}
          >
            <LogOut size={18} className="shrink-0" />
            <span className={cn("whitespace-nowrap transition-all duration-200", !sidebarOpen && "lg:hidden")}>{t.nav.logout}</span>
          </button>
          <p className={cn("text-[10px] text-gray-600 text-center pt-1 transition-all duration-200", !sidebarOpen && "lg:hidden")}>
            PondFlow © 2025
          </p>
        </div>
      </aside>
    </>
  );
}

import { NotificationPopover } from "@/shared/components/layout/notification-popover";
import { UserAvatarButton } from "@/shared/components/layout/user-avatar-button";
import { ThemeToggle } from "@/shared/components/layout/theme-toggle";
import { LanguageToggle } from "@/shared/components/layout/language-toggle";

export function Navbar() {
  const { toggleSidebar } = useAppStore();
  const { t } = useTranslation();

  return (
    <header className="h-16 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex items-center px-4 md:px-6 gap-4 sticky top-0 z-10 justify-between transition-colors duration-300">
      {/* Desktop Toggle Button */}
      <button
        className="hidden lg:flex text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 items-center justify-center border border-gray-200/60 dark:border-gray-800 shadow-xs"
        onClick={toggleSidebar}
        title="Buka / Tutup Sidebar"
      >
        <Menu size={18} />
      </button>

      {/* Search bar */}
      <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 flex-1 max-w-xs text-sm text-gray-400 dark:text-gray-400">
        <Search size={14} />
        <span>{t.common.search}</span>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
        <NotificationPopover />
        <UserAvatarButton />
      </div>
    </header>
  );
}
