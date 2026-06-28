import type { Metadata } from "next";
import { ThemeToggle } from "@/shared/components/layout/theme-toggle";
import { LanguageToggle } from "@/shared/components/layout/language-toggle";
import { AuthHeaderWrapper } from "./AuthHeaderWrapper";

export const metadata: Metadata = {
  title: {
    default: "Masuk",
    template: "%s | PondFlow",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100 dark:from-slate-950 dark:to-slate-900 p-4 relative transition-colors duration-300">
      {/* Top Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md my-8">
        <AuthHeaderWrapper />
        {children}
      </div>
    </div>
  );
}
