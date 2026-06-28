"use client";

import { useTranslation } from "@/shared/i18n/LanguageContext";

export function AuthHeaderWrapper() {
  const { language } = useTranslation();

  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 text-white text-3xl font-bold mb-3 shadow-lg shadow-sky-500/20 overflow-hidden border border-sky-300/30 mx-auto">
        <img src="/logo.png" alt="PondFlow Logo" className="w-full h-full object-cover" />
      </div>
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        Pond<span className="text-sky-600 dark:text-sky-400">Flow</span>
      </h1>
      <p className="text-sm text-gray-600 dark:text-slate-400 mt-1 font-medium">
        {language === "en"
          ? "Aquaculture Financial & IoT Management System"
          : "Sistem Manajemen Keuangan & IoT Tambak Ikan"}
      </p>
    </div>
  );
}
