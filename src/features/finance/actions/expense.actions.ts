"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/shared/lib/auth";
import { sqlite } from "@/shared/lib/sqlite/db";
import { ownsFarm } from "@/shared/lib/authorization";
import { randomUUID } from "node:crypto";

export async function createExpense(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) return { error: "Tidak terautentikasi" };

  const farmId = formData.get("farm_id") as string;
  const pondId = formData.get("pond_id") as string;
  const category = formData.get("category") as string;
  const amountStr = formData.get("amount") as string;
  const expenseDate = formData.get("expense_date") as string;
  const description = formData.get("description") as string;

  if (!farmId) return { error: "Pilih lokasi farm terlebih dahulu" };
  if (!ownsFarm(user.id, farmId)) return { error: "Farm tidak ditemukan atau Anda tidak memiliki akses" };
  if (!category) return { error: "Kategori pengeluaran wajib dipilih" };

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { error: "Nominal pengeluaran harus berupa angka lebih dari 0" };
  }

  try { sqlite.prepare("INSERT INTO expenses (id, user_id, farm_id, pond_id, category, amount, expense_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(randomUUID(), user.id, farmId, pondId && pondId !== "all" ? pondId : null, category.trim(), amount, expenseDate || new Date().toISOString().split("T")[0], description?.trim() || null); }
  catch (error) { return { error: error instanceof Error ? error.message : "Gagal menyimpan pengeluaran" }; }

  revalidatePath("/dashboard/finance/expenses");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteExpense(expenseId: string) {
  const user = await getCurrentUser();

  if (!user) return { error: "Tidak terautentikasi" };

  sqlite.prepare("DELETE FROM expenses WHERE id = ? AND user_id = ?").run(expenseId, user.id);

  revalidatePath("/dashboard/finance/expenses");
  revalidatePath("/dashboard");
  return { success: true };
}
