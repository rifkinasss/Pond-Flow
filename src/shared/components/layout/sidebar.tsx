"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/store/app.store";
import { createClient } from "@/shared/lib/supabase/client";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/farms", label: "Lokasi / Farm", icon: MapPin },
  { href: "/dashboard/ponds", label: "Kolam", icon: Fish },
  { href: "/dashboard/finance/expenses", label: "Pengeluaran", icon: Wallet },
  { href: "/dashboard/inventory", label: "Inventori", icon: Package },
  { href: "/dashboard/reports", label: "Laporan & HPP", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Berhasil keluar");
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-border flex flex-col transition-transform duration-200",
          "lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center text-base font-bold">
              🐟
            </div>
            <span className="font-bold text-lg text-gray-900">PondFlow</span>
          </div>
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-0.5 px-3">
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
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sky-50 text-sky-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut size={18} />
            Keluar
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            NasLabs.id © 2025
          </p>
        </div>
      </aside>
    </>
  );
}

export function Navbar() {
  const { toggleSidebar } = useAppStore();

  return (
    <header className="h-16 border-b border-border bg-white flex items-center px-4 gap-4 sticky top-0 z-10">
      <button
        className="lg:hidden text-muted-foreground hover:text-foreground"
        onClick={toggleSidebar}
      >
        <Menu size={22} />
      </button>
      <div className="flex-1" />
      {/* Slot untuk breadcrumb / actions bisa ditambahkan di sini */}
    </header>
  );
}
