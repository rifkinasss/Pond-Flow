"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, CheckCircle2, Circle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/shared/lib/supabase/client";

const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .regex(/[A-Z]/, "Harus mengandung minimal 1 huruf kapital")
  .regex(/[0-9]/, "Harus mengandung minimal 1 angka");

const registerSchema = z
  .object({
    displayName: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Format email tidak valid"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

function PasswordRequirements({ password }: { password: string }) {
  const rules = [
    { label: "Minimal 8 karakter", met: password.length >= 8 },
    { label: "1 huruf kapital (A-Z)", met: /[A-Z]/.test(password) },
    { label: "1 angka (0-9)", met: /[0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <ul className="space-y-1 mt-1.5">
      {rules.map((r) => (
        <li key={r.label} className="flex items-center gap-1.5 text-xs">
          {r.met
            ? <CheckCircle2 size={12} className="text-green-500 shrink-0" />
            : <Circle size={12} className="text-muted-foreground shrink-0" />}
          <span className={r.met ? "text-green-600" : "text-muted-foreground"}>
            {r.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { display_name: data.displayName },
      },
    });

    if (error) {
      toast.error("Pendaftaran gagal", { description: error.message });
      return;
    }

    toast.success("Akun berhasil dibuat!", {
      description: "Silakan cek email Anda untuk konfirmasi, lalu login.",
    });
    router.push("/login");
  };

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Buat akun baru</CardTitle>
        <CardDescription>
          Daftar gratis dan mulai kelola budidaya ikan Anda
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Nama Lengkap</Label>
            <Input
              id="displayName"
              placeholder="Contoh: Budi Santoso"
              {...register("displayName")}
            />
            {errors.displayName && (
              <p className="text-xs text-destructive">
                {errors.displayName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 karakter, 1 kapital, 1 angka"
                autoComplete="new-password"
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <PasswordRequirements password={watch("password") ?? ""} />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Ulangi password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mendaftarkan...
              </>
            ) : (
              "Daftar Sekarang"
            )}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Masuk di sini
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
