"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/client";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/shared/i18n/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserAvatarButton() {
  const [avatar, setAvatar] = useState<string>("🐟");
  const router = useRouter();
  const { language } = useTranslation();

  useEffect(() => {
    const fetchUserAvatar = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.user_metadata?.avatar) {
        setAvatar(user.user_metadata.avatar);
      }
    };

    fetchUserAvatar();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success(language === "en" ? "Logged out successfully" : "Berhasil keluar");
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none focus:outline-none">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-white text-base shadow-sm hover:scale-105 active:scale-95 transition-transform border border-sky-300/40 select-none cursor-pointer">
          {avatar}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-gray-100 dark:border-slate-800 shadow-xl p-1 z-50 mt-2"
      >
        <DropdownMenuItem className="p-0">
          <Link
            href="/dashboard/profile"
            className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 text-gray-700 dark:text-slate-200 hover:bg-slate-55 dark:hover:bg-slate-800 transition-colors"
          >
            <User size={14} className="text-sky-500" />
            {language === "en" ? "My Profile" : "Profil Saya"}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-xs font-semibold px-3 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <LogOut size={14} />
          {language === "en" ? "Sign Out" : "Keluar Akun"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
