"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, CheckCircle2, Circle, MailCheck, User, Mail, Lock } from "lucide-react";

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

const passwordSchema = z
  .string()
  .min(1, "Password wajib diisi")
  .min(8, "Password minimal 8 karakter")
  .regex(/[A-Z]/, "Harus mengandung minimal 1 huruf kapital")
  .regex(/[0-9]/, "Harus mengandung minimal 1 angka");

const registerSchema = z
  .object({
    displayName: z
      .string()
      .min(1, "Nama wajib diisi")
      .min(2, "Nama minimal 2 karakter"),
    email: z
      .string()
      .min(1, "Email wajib diisi")
      .email("Format email tidak valid"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

function PasswordRequirements({ password }: { password: string }) {
  const { language } = useTranslation();
  const rules = [
    {
      label: language === "en" ? "At least 8 characters" : "Minimal 8 karakter",
      met: password.length >= 8,
    },
    {
      label: language === "en" ? "1 uppercase letter (A-Z)" : "1 huruf kapital (A-Z)",
      met: /[A-Z]/.test(password),
    },
    {
      label: language === "en" ? "1 number (0-9)" : "1 angka (0-9)",
      met: /[0-9]/.test(password),
    },
  ];
  if (!password) return null;
  return (
    <ul className="space-y-1 mt-1.5">
      {rules.map((r) => (
        <li key={r.label} className="flex items-center gap-1.5 text-xs">
          {r.met
            ? <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
            : <Circle size={12} className="text-gray-400 dark:text-slate-500 shrink-0" />}
          <span className={r.met ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-gray-500 dark:text-slate-400"}>
            {r.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function RegisterPage() {
  const { language } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
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
      toast.error(language === "en" ? "Registration failed" : "Pendaftaran gagal", { description: error.message });
      return;
    }

    setRegisteredEmail(data.email);
    setRegistered(true);
  };

  if (registered) {
    return (
      <Card className="shadow-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
        <CardHeader className="space-y-1 items-center text-center px-6 pt-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-sky-50 dark:bg-sky-950/60 mb-2 border border-sky-100 dark:border-sky-800/50">
            <MailCheck className="w-8 h-8 text-sky-600 dark:text-sky-400" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {language === "en" ? "Check your email!" : "Cek email Anda!"}
          </CardTitle>
          <CardDescription className="text-xs text-gray-500 dark:text-slate-400">
            {language === "en" ? "We sent a confirmation link to" : "Kami telah mengirimkan link konfirmasi ke"}
          </CardDescription>
          <p className="text-sm font-bold text-sky-600 dark:text-sky-400">{registeredEmail}</p>
        </CardHeader>
        <CardContent className="space-y-4 text-center px-6 py-4">
          <p className="text-xs text-gray-600 dark:text-slate-300">
            {language === "en"
              ? "Open your email and click the confirmation link to activate your account."
              : "Buka email Anda dan klik link konfirmasi untuk mengaktifkan akun. Setelah dikonfirmasi, Anda bisa login."}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 px-6 pb-6 pt-2">
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full rounded-xl dark:border-slate-800 font-bold">
              {language === "en" ? "Go to Sign In page" : "Pergi ke Halaman Login"}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="shadow-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
      <CardHeader className="space-y-1.5 px-6 pt-6 pb-2">
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
          {language === "en" ? "Create New Account" : "Buat Akun Baru"}
        </CardTitle>
        <CardDescription className="text-xs text-gray-500 dark:text-slate-400">
          {language === "en" ? "Sign up for free to manage your aquaculture ponds" : "Daftar gratis dan mulai kelola budidaya ikan Anda"}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4 px-6 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="displayName" className="text-xs font-semibold text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
              <User size={13} className="text-sky-500" />
              {language === "en" ? "Full Name" : "Nama Lengkap"}
            </Label>
            <Input
              id="displayName"
              placeholder={language === "en" ? "e.g. John Doe" : "Contoh: Budi Santoso"}
              className="rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-gray-900 dark:text-white font-medium focus:ring-sky-500"
              {...register("displayName")}
            />
            {errors.displayName && (
              <p className="text-xs font-medium text-red-500">
                {errors.displayName.message}
              </p>
            )}
          </div>

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
            <Label htmlFor="password" className="text-xs font-semibold text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
              <Lock size={13} className="text-sky-500" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={language === "en" ? "Min. 8 chars, 1 uppercase, 1 number" : "Min. 8 karakter, 1 kapital, 1 angka"}
                autoComplete="new-password"
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
            <PasswordRequirements password={watch("password") ?? ""} />
            {errors.password && (
              <p className="text-xs font-medium text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-700 dark:text-slate-200">
              {language === "en" ? "Confirm Password" : "Konfirmasi Password"}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={language === "en" ? "Repeat password" : "Ulangi password"}
              autoComplete="new-password"
              className="rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-gray-900 dark:text-white font-medium focus:ring-sky-500"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs font-medium text-red-500">
                {errors.confirmPassword.message}
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
                {language === "en" ? "Signing up..." : "Mendaftarkan..."}
              </>
            ) : (
              language === "en" ? "Sign Up Now" : "Daftar Sekarang"
            )}
          </Button>
          <p className="text-xs text-center text-gray-600 dark:text-slate-400 font-medium">
            {language === "en" ? "Already have an account? " : "Sudah punya akun? "}
            <Link
              href="/login"
              className="text-sky-600 dark:text-sky-400 font-bold hover:underline"
            >
              {language === "en" ? "Sign in here" : "Masuk di sini"}
            </Link>
          </p>
          <p className="text-[10px] text-center text-gray-400 dark:text-slate-500 font-bold mt-1 select-none">
            v1.0.1
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
