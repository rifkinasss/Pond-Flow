import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pengeluaran" };

export default function ExpensesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pengeluaran</h1>
      <p className="text-muted-foreground">Pencatatan pengeluaran operasional. (Coming soon)</p>
    </div>
  );
}
