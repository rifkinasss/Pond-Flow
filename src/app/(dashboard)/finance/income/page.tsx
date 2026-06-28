import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pemasukan" };

export default function IncomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pemasukan</h1>
      <p className="text-muted-foreground">Pencatatan hasil panen & pemasukan lainnya. (Coming soon)</p>
    </div>
  );
}
