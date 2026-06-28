"use server";

import { createClient } from "@/shared/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Pengguna tidak terotentikasi" };

  const displayName = formData.get("display_name") as string;
  const phone = formData.get("phone") as string;
  const businessName = formData.get("business_name") as string;
  const avatar = formData.get("avatar") as string;

  const { error } = await supabase.auth.updateUser({
    data: {
      display_name: displayName,
      phone: phone,
      business_name: businessName,
      avatar: avatar || "🐟",
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Pengguna tidak terotentikasi" };

  const newPassword = formData.get("new_password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (newPassword !== confirmPassword) {
    return { error: "Konfirmasi kata sandi tidak cocok" };
  }

  if (newPassword.length < 6) {
    return { error: "Kata sandi minimal 6 karakter" };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
