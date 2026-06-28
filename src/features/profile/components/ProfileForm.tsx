"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { User, Phone, Building2, Lock, Save, KeyRound, Check, ShieldCheck } from "lucide-react";
import { updateProfile, updatePassword } from "@/features/profile/actions/profile.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AVATAR_OPTIONS = [
  { emoji: "🐟", label: "Ikan" },
  { emoji: "🦐", label: "Udang" },
  { emoji: "👨‍🌾", label: "Petambak" },
  { emoji: "🌊", label: "Laut" },
  { emoji: "⚓", label: "Jangkar" },
  { emoji: "⛵", label: "Kapal" },
];

interface ProfileFormProps {
  user: {
    email?: string;
    user_metadata?: {
      display_name?: string;
      phone?: string;
      business_name?: string;
      avatar?: string;
    };
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const metadata = user.user_metadata || {};
  const [selectedAvatar, setSelectedAvatar] = useState(metadata.avatar || "🐟");

  const [isProfilePending, startProfileTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("avatar", selectedAvatar);

    startProfileTransition(async () => {
      const result = await updateProfile(formData);
      if (result?.error) {
        toast.error("Gagal memperbarui profil", { description: result.error });
      } else {
        toast.success("Profil berhasil diperbarui! 🎉");
      }
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startPasswordTransition(async () => {
      const result = await updatePassword(formData);
      if (result?.error) {
        toast.error("Gagal mengubah kata sandi", { description: result.error });
      } else {
        toast.success("Kata sandi berhasil diubah! 🔒");
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  return (
    <div className="space-y-8">

      {/* ── Section 1: Profil & Informasi Personal ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/50">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Informasi Personal & Usaha</h2>
            <p className="text-xs text-muted-foreground dark:text-slate-400">Kelola nama tampilan, nomor kontak, dan profil tambak Anda</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-6">

          {/* Avatar Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700 dark:text-slate-200">Pilih Persona Avatar Budidaya</Label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  key={opt.emoji}
                  type="button"
                  onClick={() => setSelectedAvatar(opt.emoji)}
                  className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all relative ${
                    selectedAvatar === opt.emoji
                      ? "bg-sky-500 text-white shadow-lg shadow-sky-200 dark:shadow-none scale-110 ring-2 ring-sky-500 ring-offset-2 dark:ring-offset-slate-900"
                      : "bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-700"
                  }`}
                >
                  {opt.emoji}
                  {selectedAvatar === opt.emoji && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border border-white dark:border-slate-900">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Display Name */}
            <div className="space-y-1.5">
              <Label htmlFor="display_name" className="text-xs font-medium text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
                <User size={13} className="text-sky-500" />
                Nama Lengkap / Tampilan <span className="text-red-500">*</span>
              </Label>
              <Input
                id="display_name"
                name="display_name"
                type="text"
                defaultValue={metadata.display_name || ""}
                placeholder="Contoh: Budi Santoso"
                required
                disabled={isProfilePending}
                className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white focus:ring-sky-500 focus:border-sky-500 font-medium"
              />
            </div>

            {/* Phone / WA */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-medium text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
                <Phone size={13} className="text-sky-500" />
                Nomor WhatsApp / Kontak
              </Label>
              <Input
                id="phone"
                name="phone"
                type="text"
                defaultValue={metadata.phone || ""}
                placeholder="Contoh: 081234567890"
                disabled={isProfilePending}
                className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white focus:ring-sky-500 focus:border-sky-500 font-medium"
              />
            </div>

            {/* Business Name */}
            <div className="space-y-1.5">
              <Label htmlFor="business_name" className="text-xs font-medium text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
                <Building2 size={13} className="text-sky-500" />
                Nama Usaha Tambak / Perusahaan
              </Label>
              <Input
                id="business_name"
                name="business_name"
                type="text"
                defaultValue={metadata.business_name || ""}
                placeholder="Contoh: Tambak Nusantara Jaya"
                disabled={isProfilePending}
                className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white focus:ring-sky-500 focus:border-sky-500 font-medium"
              />
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-gray-700 dark:text-slate-200">
                Email Terdaftar (Akun)
              </Label>
              <Input
                id="email"
                type="email"
                value={user.email || ""}
                disabled
                className="rounded-xl border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/40 text-gray-500 dark:text-slate-400 font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isProfilePending}
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl px-6 py-2.5 shadow-md shadow-sky-200 dark:shadow-none transition-all hover:shadow-lg inline-flex items-center gap-2"
            >
              <Save size={16} />
              {isProfilePending ? "Simpan..." : "Simpan Perubahan Profil"}
            </Button>
          </div>
        </form>
      </div>

      {/* ── Section 2: Keamanan & Keamanan Akun ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Keamanan Akun & Kata Sandi</h2>
            <p className="text-xs text-muted-foreground dark:text-slate-400">Perbarui kata sandi Anda secara berkala untuk menjaga keamanan akun</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
          <div className="space-y-1.5">
            <Label htmlFor="new_password" className="text-xs font-medium text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
              <KeyRound size={13} className="text-amber-500" />
              Kata Sandi Baru <span className="text-red-500">*</span>
            </Label>
            <Input
              id="new_password"
              name="new_password"
              type="password"
              placeholder="Minimal 6 karakter"
              required
              minLength={6}
              disabled={isPasswordPending}
              className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white focus:ring-sky-500 focus:border-sky-500 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm_password" className="text-xs font-medium text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
              <Lock size={13} className="text-amber-500" />
              Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
            </Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              placeholder="Ulangi kata sandi baru"
              required
              minLength={6}
              disabled={isPasswordPending}
              className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white focus:ring-sky-500 focus:border-sky-500 font-medium"
            />
          </div>

          <div className="pt-2 flex justify-start">
            <Button
              type="submit"
              disabled={isPasswordPending}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl px-6 py-2.5 shadow-md shadow-amber-200 dark:shadow-none transition-all hover:shadow-lg inline-flex items-center gap-2"
            >
              <Lock size={16} />
              {isPasswordPending ? "Memproses..." : "Ubah Kata Sandi"}
            </Button>
          </div>
        </form>
      </div>

    </div>
  );
}
