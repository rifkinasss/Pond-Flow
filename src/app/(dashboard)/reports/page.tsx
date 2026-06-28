import type { Metadata } from "next";

export const metadata: Metadata = { title: "Laporan & HPP" };

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Laporan & HPP</h1>
      <p className="text-muted-foreground">Laporan laba/rugi, HPP, dan AI Insight. (Coming soon)</p>
    </div>
  );
}
