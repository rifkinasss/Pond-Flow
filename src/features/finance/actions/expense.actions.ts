"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";

export async function createExpense(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const farmId = formData.get("farm_id") as string;
  const pondId = formData.get("pond_id") as string;
  const category = formData.get("category") as string;
  const amountStr = formData.get("amount") as string;
  const expenseDate = formData.get("expense_date") as string;
  const description = formData.get("description") as string;

  if (!farmId) return { error: "Pilih lokasi farm terlebih dahulu" };
  if (!category) return { error: "Kategori pengeluaran wajib dipilih" };

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { error: "Nominal pengeluaran harus berupa angka lebih dari 0" };
  }

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    farm_id: farmId,
    pond_id: pondId && pondId !== "all" ? pondId : null,
    category: category.trim(),
    amount,
    expense_date: expenseDate || new Date().toISOString().split("T")[0],
    description: description?.trim() || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/finance/expenses");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteExpense(expenseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/finance/expenses");
  revalidatePath("/dashboard");
  return { success: true };
}
