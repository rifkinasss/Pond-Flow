import type { Metadata } from "next";

export const metadata: Metadata = { title: "Lokasi / Farm" };

export default function FarmsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Lokasi / Farm</h1>
      <p className="text-muted-foreground">Manajemen lokasi tambak Anda. (Coming soon)</p>
    </div>
  );
}
