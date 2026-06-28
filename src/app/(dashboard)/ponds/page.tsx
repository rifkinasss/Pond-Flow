import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kolam" };

export default function PondsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Kolam</h1>
      <p className="text-muted-foreground">Manajemen kolam & siklus budidaya. (Coming soon)</p>
    </div>
  );
}
