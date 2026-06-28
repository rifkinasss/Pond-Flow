import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/server";
import { Sidebar, Navbar } from "@/shared/components/layout/sidebar";
import { BottomNav } from "@/shared/components/layout/bottom-nav";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | PondFlow",
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
