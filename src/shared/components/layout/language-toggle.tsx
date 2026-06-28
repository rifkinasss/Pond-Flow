"use client";

import { useState } from "react";
import { Globe, Check } from "lucide-react";
import { useTranslation } from "@/shared/i18n/LanguageContext";

export function LanguageToggle() {
  const { language, setLanguage } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs font-bold text-gray-700 dark:text-slate-200 transition-colors shadow-xs"
      >
        <Globe size={14} className="text-sky-500" />
        <span>{language === "id" ? "ID" : "EN"}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-50 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 py-1 min-w-[150px] animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setLanguage("id");
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="font-bold text-sky-600 dark:text-sky-400">
                  ID
                </span>{" "}
                Bahasa Indonesia
              </span>
              {language === "id" && (
                <Check size={14} className="text-sky-500 font-bold" />
              )}
            </button>
            <button
              onClick={() => {
                setLanguage("en");
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="font-bold text-sky-600 dark:text-sky-400">
                  EN
                </span>{" "}
                English
              </span>
              {language === "en" && (
                <Check size={14} className="text-sky-500 font-bold" />
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
