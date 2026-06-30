"use client";

import { useState } from "react";
import { useTransitionRouter } from "@/shared/hooks/useTransitionRouter";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Lock, Mail } from "lucide-react";

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
import { useTranslation } from "@/shared/i18n/LanguageContext";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useTransitionRouter();
  const { language } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(language === "en" ? "Sign in failed" : "Login gagal", {
        description:
          error.message === "Invalid login credentials"
            ? language === "en" ? "Wrong email or password" : "Email atau password salah"
            : error.message,
      });
      return;
    }

    toast.success(language === "en" ? "Signed in successfully!" : "Berhasil masuk!");
    router.push("/dashboard");
  };

  return (
    <Card className="shadow-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
      <CardHeader className="space-y-1.5 px-6 pt-6 pb-2">
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
          {language === "en" ? "Sign In to Account" : "Masuk ke Akun"}
        </CardTitle>
        <CardDescription className="text-xs text-gray-500 dark:text-slate-400">
          {language === "en" ? "Enter your email and password to continue" : "Masukkan email dan password Anda untuk melanjutkan"}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4 px-6 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
              <Mail size={13} className="text-sky-500" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={language === "en" ? "name@email.com" : "nama@email.com"}
              autoComplete="email"
              className="rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-gray-900 dark:text-white font-medium focus:ring-sky-500"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs font-medium text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
                <Lock size={13} className="text-sky-500" />
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
              >
                {language === "en" ? "Forgot password?" : "Lupa password?"}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pr-10 rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-gray-900 dark:text-white font-medium focus:ring-sky-500"
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 px-6 pb-6 pt-2">
          <Button
            type="submit"
            className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold h-10 shadow-md shadow-sky-200 dark:shadow-none transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {language === "en" ? "Signing in..." : "Memproses..."}
              </>
            ) : (
              language === "en" ? "Sign In" : "Masuk"
            )}
          </Button>
          <p className="text-xs text-center text-gray-600 dark:text-slate-400 font-medium">
            {language === "en" ? "Don't have an account? " : "Belum punya akun? "}
            <Link
              href="/register"
              className="text-sky-600 dark:text-sky-400 font-bold hover:underline"
            >
              {language === "en" ? "Sign up now" : "Daftar sekarang"}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
