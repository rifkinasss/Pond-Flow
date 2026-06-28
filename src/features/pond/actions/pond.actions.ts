"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";

export async function createPond(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const farmId = formData.get("farm_id") as string;
  const name = formData.get("name") as string;
  const type = (formData.get("type") as string) || "Terpal";
  const description = formData.get("description") as string;

  if (!farmId) {
    return { error: "Pilih lokasi farm terlebih dahulu" };
  }

  if (!name || name.trim().length < 2) {
    return { error: "Nama kolam minimal 2 karakter" };
  }

  // Ensure farm belongs to user
  const { data: farm } = await supabase
    .from("farms")
    .select("id")
    .eq("id", farmId)
    .eq("user_id", user.id)
    .single();

  if (!farm) {
    return { error: "Farm tidak ditemukan atau Anda tidak memiliki akses" };
  }

  const { error } = await supabase.from("ponds").insert({
    farm_id: farmId,
    name: name.trim(),
    type: type.trim(),
    description: description?.trim() || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/ponds");
  revalidatePath("/dashboard/farms");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deletePond(pondId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  // Delete pond
  const { error } = await supabase.from("ponds").delete().eq("id", pondId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/ponds");
  revalidatePath("/dashboard/farms");
  revalidatePath("/dashboard");
  return { success: true };
}
