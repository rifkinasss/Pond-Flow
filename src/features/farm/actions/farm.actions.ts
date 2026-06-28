"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";

export async function createFarm(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const description = formData.get("description") as string;
  const latitudeStr = formData.get("latitude") as string;
  const longitudeStr = formData.get("longitude") as string;

  const latitude = latitudeStr ? parseFloat(latitudeStr) : null;
  const longitude = longitudeStr ? parseFloat(longitudeStr) : null;

  if (!name || name.trim().length < 2) {
    return { error: "Nama farm minimal 2 karakter" };
  }

  const { error } = await supabase.from("farms").insert({
    user_id: user.id,
    name: name.trim(),
    address: address?.trim() || null,
    description: description?.trim() || null,
    latitude,
    longitude,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/farms");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteFarm(farmId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const { error } = await supabase
    .from("farms")
    .delete()
    .eq("id", farmId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/farms");
  revalidatePath("/dashboard");
  return { success: true };
}
