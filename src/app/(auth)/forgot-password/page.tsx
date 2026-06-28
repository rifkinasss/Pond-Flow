"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

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

const forgotSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { language } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/dashboard/profile`,
    });

    if (error) {
      toast.error(language === "en" ? "Failed to send reset link" : "Gagal mengirimkan link reset", {
        description: error.message,
      });
      return;
    }

    setSubmittedEmail(data.email);
    setSubmitted(true);
    toast.success(language === "en" ? "Reset link sent!" : "Link reset berhasil dikirim!");
  };

  if (submitted) {
    return (
      <Card className="shadow-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
        <CardHeader className="space-y-1 items-center text-center px-6 pt-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-sky-50 dark:bg-sky-950/60 mb-2 border border-sky-100 dark:border-sky-800/50">
            <CheckCircle2 className="w-8 h-8 text-sky-600 dark:text-sky-400" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {language === "en" ? "Check your email" : "Cek Email Anda"}
          </CardTitle>
          <CardDescription className="text-xs text-gray-500 dark:text-slate-400">
            {language === "en" ? "We have sent password reset instructions to:" : "Kami telah mengirimkan instruksi reset password ke:"}
          </CardDescription>
          <p className="text-sm font-bold text-sky-600 dark:text-sky-400">{submittedEmail}</p>
        </CardHeader>
        <CardContent className="space-y-4 text-center px-6 py-4">
          <p className="text-xs text-gray-600 dark:text-slate-300">
            {language === "en"
              ? "Click the link in your email to reset your password and gain access to your account."
              : "Klik link di email Anda untuk mengatur ulang kata sandi dan mengakses kembali akun Anda."}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 px-6 pb-6 pt-2">
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full rounded-xl dark:border-slate-800 font-bold flex items-center justify-center gap-2">
              <ArrowLeft size={16} />
              {language === "en" ? "Back to Sign In" : "Kembali ke Halaman Login"}
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
          {language === "en" ? "Reset Password" : "Lupa Kata Sandi?"}
        </CardTitle>
        <CardDescription className="text-xs text-gray-500 dark:text-slate-400">
          {language === "en"
            ? "Enter your email address and we will send you a password reset link."
            : "Masukkan email terdaftar Anda untuk menerima link atur ulang kata sandi."}
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
              placeholder="nama@email.com"
              autoComplete="email"
              className="rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-gray-900 dark:text-white font-medium focus:ring-sky-500"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs font-medium text-red-500">{errors.email.message}</p>
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
                {language === "en" ? "Sending link..." : "Mengirimkan link..."}
              </>
            ) : (
              language === "en" ? "Send Reset Link" : "Kirim Link Reset"
            )}
          </Button>
          <Link href="/login" className="w-full text-center">
            <span className="text-xs font-semibold text-gray-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 flex items-center justify-center gap-1">
              <ArrowLeft size={14} />
              {language === "en" ? "Back to Sign In" : "Kembali ke Halaman Login"}
            </span>
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
