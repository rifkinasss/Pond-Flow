"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type GrowthPoint = { period: string; users: number; farms: number; ponds: number };
type RolePoint = { name: string; value: number };

export function AdminOverviewCharts({ growth, roles }: { growth: GrowthPoint[]; roles: RolePoint[] }) {
  const colors = ["#0284c7", "#10b981", "#f59e0b"];
  return <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
    <Card className="border-0 shadow-sm">
      <CardHeader><CardTitle>Pertumbuhan data</CardTitle><CardDescription>Registrasi dan aset yang tercatat dalam enam bulan terakhir.</CardDescription></CardHeader>
      <CardContent>{growth.length ? <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={growth} margin={{ top: 4, right: 8, left: -22, bottom: 0 }} barGap={4}><CartesianGrid vertical={false} stroke="#e2e8f0" /><XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} /><Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} /><Bar dataKey="users" name="Pengguna" fill="#0284c7" radius={[3, 3, 0, 0]} /><Bar dataKey="farms" name="Farm" fill="#10b981" radius={[3, 3, 0, 0]} /><Bar dataKey="ponds" name="Kolam" fill="#94a3b8" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div> : <EmptyChart />}</CardContent>
    </Card>
    <Card className="border-0 shadow-sm">
      <CardHeader><CardTitle>Distribusi role</CardTitle><CardDescription>Komposisi akses pengguna saat ini.</CardDescription></CardHeader>
      <CardContent>{roles.some((item) => item.value > 0) ? <><div className="h-48"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={roles} dataKey="value" nameKey="name" innerRadius={52} outerRadius={76} paddingAngle={2}>{roles.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} /></PieChart></ResponsiveContainer></div><div className="space-y-2">{roles.map((role, index) => <div key={role.name} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-muted-foreground"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />{role.name}</span><span className="font-medium">{role.value}</span></div>)}</div></> : <EmptyChart />}</CardContent>
    </Card>
  </div>;
}

function EmptyChart() { return <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Belum ada data untuk ditampilkan.</div>; }
