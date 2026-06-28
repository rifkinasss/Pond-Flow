import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inventori" };

export default function InventoryPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Inventori</h1>
      <p className="text-muted-foreground">Manajemen stok pakan & saprokan. (Coming soon)</p>
    </div>
  );
}
