"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm() {
  const params = useSearchParams(); const router = useRouter(); const token = params.get("token") || "";
  const [password, setPassword] = useState(""); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setLoading(true); const response = await fetch("/api/auth/reset", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, password }) }); const body = await response.json(); setLoading(false); if (!response.ok) { setMessage(body.error || "Gagal mengubah password"); return; } setMessage("Password berhasil diubah."); setTimeout(() => router.push("/login"), 1000); };
  return <form onSubmit={submit} className="w-full max-w-sm space-y-4"><h1 className="text-xl font-bold">Reset Password</h1><Input type="password" minLength={8} required placeholder="Password baru" value={password} onChange={(e) => setPassword(e.target.value)} /><Button className="w-full" disabled={loading || !token}>{loading ? "Memproses..." : "Simpan Password"}</Button>{message && <p className="text-sm text-muted-foreground">{message}</p>}</form>;
}
