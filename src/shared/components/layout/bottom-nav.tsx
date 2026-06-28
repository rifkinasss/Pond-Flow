"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Fish,
  Wallet,
  Package,
  BarChart3,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

const bottomNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/ponds", label: "Kolam", icon: Fish },
  { href: "/dashboard/inventory", label: "Stok", icon: Package },
  { href: "/dashboard/finance/expenses", label: "Biaya", icon: Wallet },
  { href: "/dashboard/reports", label: "Laporan", icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const mainEl = document.querySelector("main");
    if (!mainEl) return;

    let lastScrollTop = mainEl.scrollTop;

    const handleScroll = () => {
      const currentScrollTop = mainEl.scrollTop;

      // Jika scroll ke bawah dan sudah lewat header -> mengecil
      if (currentScrollTop > lastScrollTop && currentScrollTop > 20) {
        setIsScrolled(true);
      }
      // Jika scroll ke atas -> kembali default
      else if (currentScrollTop < lastScrollTop) {
        setIsScrolled(false);
      }

      lastScrollTop = Math.max(0, currentScrollTop);
    };

    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "lg:hidden fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto bg-white/85 dark:bg-gray-900/90 backdrop-blur-xl border border-white/80 dark:border-gray-800 rounded-full flex items-center justify-around ring-1 ring-black/5 dark:ring-white/10 transition-all duration-300 ease-out origin-bottom",
        isScrolled
          ? "py-1 px-3 scale-90 opacity-80 shadow-lg shadow-sky-900/10"
          : "py-1.5 px-3 scale-100 opacity-100 shadow-2xl shadow-sky-900/20"
      )}
    >
      {bottomNavItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center rounded-full transition-all duration-200 relative min-w-[48px]",
              isActive
                ? "text-sky-600 dark:text-sky-400 font-bold"
                : "text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-medium"
            )}
          >
            <div
              className={cn(
                "rounded-full transition-all duration-300",
                isScrolled ? "p-1" : "p-1.5",
                isActive ? "bg-sky-500 text-white shadow-md shadow-sky-200" : ""
              )}
            >
              <Icon size={isScrolled ? 16 : 18} />
            </div>
            <span
              className={cn(
                "leading-tight transition-all duration-300 font-medium text-center",
                isScrolled ? "text-[8px] opacity-75" : "text-[10px] opacity-100 mt-0.5"
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
