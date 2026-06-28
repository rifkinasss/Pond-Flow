"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/shared/lib/supabase/client";

export function UserAvatarButton() {
  const [avatar, setAvatar] = useState<string>("🐟");

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

  return (
    <Link
      href="/dashboard/profile"
      title="Edit Profil & Pengaturan Akun"
      className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-white text-base shadow-sm hover:scale-110 transition-transform border border-sky-300/40 select-none"
    >
      {avatar}
    </Link>
  );
}
