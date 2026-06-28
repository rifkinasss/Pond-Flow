import type { Metadata } from "next";
import { createClient } from "@/shared/lib/supabase/server";
import { User, ShieldCheck } from "lucide-react";
import { ProfileForm } from "@/features/profile/components/ProfileForm";

export const metadata: Metadata = { title: "Edit Profil & Pengaturan" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const metadata = user.user_metadata || {};
  const avatarEmoji = metadata.avatar || "🐟";
  const displayName = metadata.display_name || user.email?.split("@")[0] || "Pengguna";
  const businessName = metadata.business_name || "Tambak Mandiri";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-3xl shadow-lg shadow-sky-900/20 shrink-0">
            {avatarEmoji}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">
              {displayName}
            </h1>
            <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold mt-0.5 flex items-center gap-1.5">
              <span>🏢</span> {businessName}
            </p>
            <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">
              ✉️ {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* ── Form Components ── */}
      <ProfileForm user={user} />

    </div>
  );
}
