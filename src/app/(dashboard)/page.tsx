import type { Metadata } from "next";
import { createClient } from "@/shared/lib/supabase/server";
import { formatCurrency } from "@/shared/lib/utils";
import { Fish, Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Ambil jumlah farm milik user
  const { count: farmCount } = await supabase
    .from("farms")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  const stats = [
    {
      title: "Total Farm",
      value: farmCount ?? 0,
      unit: "lokasi",
      icon: Fish,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      title: "Kolam Aktif",
      value: 0,
      unit: "kolam",
      icon: Fish,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Pengeluaran Bulan Ini",
      value: formatCurrency(0),
      unit: "",
      icon: Wallet,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Pemasukan Bulan Ini",
      value: formatCurrency(0),
      unit: "",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Selamat datang kembali! Berikut ringkasan bisnis budidaya Anda.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                  <Icon size={16} className={stat.color} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-900">
                  {stat.value}
                </div>
                {stat.unit && (
                  <p className="text-xs text-muted-foreground">{stat.unit}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty state jika belum ada farm */}
      {(farmCount ?? 0) === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <div className="p-3 rounded-full bg-sky-50">
              <AlertCircle size={24} className="text-sky-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Belum ada farm</p>
              <p className="text-sm text-muted-foreground mt-1">
                Mulai dengan menambahkan lokasi farm / tambak pertama Anda
              </p>
            </div>
            <a
              href="/dashboard/farms"
              className="mt-1 text-sm text-sky-600 font-medium hover:underline"
            >
              + Tambah Farm Sekarang
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
