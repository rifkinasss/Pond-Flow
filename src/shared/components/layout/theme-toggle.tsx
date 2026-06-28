"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-xl bg-gray-100 animate-pulse" />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors outline-none flex items-center justify-center"
        title="Pilih Tema Tampilan"
      >
        {theme === "dark" ? (
          <Moon size={18} className="text-sky-400" />
        ) : theme === "light" ? (
          <Sun size={18} className="text-amber-500" />
        ) : (
          <Laptop size={18} className="text-sky-500" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-44 p-1.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-gray-100 shadow-xl z-50 mt-2 text-xs space-y-0.5"
      >
        <button
          onClick={() => setTheme("light")}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors ${
            theme === "light"
              ? "bg-sky-50 text-sky-600 font-semibold"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-2">
            <Sun size={15} className="text-amber-500" />
            <span>Mode Terang</span>
          </div>
          {theme === "light" && <Check size={14} className="text-sky-600" />}
        </button>

        <button
          onClick={() => setTheme("dark")}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors ${
            theme === "dark"
              ? "bg-sky-50 text-sky-600 font-semibold"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-2">
            <Moon size={15} className="text-sky-400" />
            <span>Mode Gelap</span>
          </div>
          {theme === "dark" && <Check size={14} className="text-sky-600" />}
        </button>

        <button
          onClick={() => setTheme("system")}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors ${
            theme === "system"
              ? "bg-sky-50 text-sky-600 font-semibold"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-2">
            <Laptop size={15} className="text-sky-500" />
            <span>Ikuti Sistem</span>
          </div>
          {theme === "system" && <Check size={14} className="text-sky-600" />}
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
