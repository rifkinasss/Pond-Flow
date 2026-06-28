"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, MoreVertical, Loader2, MapPin, Fish, Calendar } from "lucide-react";
import { deleteExpense } from "@/features/finance/actions/expense.actions";
import { formatCurrency } from "@/shared/lib/utils";
import type { Expense } from "@/shared/types/database.types";
import { EXPENSE_CATEGORIES } from "@/features/finance/constants/expense.constants";

interface ExpenseCardProps {
  expense: Expense;
  farmName?: string;
  pondName?: string;
}

export function ExpenseCard({ expense, farmName, pondName }: ExpenseCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const categoryObj = EXPENSE_CATEGORIES.find((c) => c.id === expense.category) || {
    id: expense.category,
    name: expense.category,
    icon: "💸",
    color: "bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700",
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteExpense(expense.id);
      if (result?.error) {
        toast.error("Gagal menghapus pengeluaran", { description: result.error });
      } else {
        toast.success("Catatan pengeluaran berhasil dihapus");
        setConfirmDelete(false);
      }
    });
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center shrink-0 text-xl shadow-xs border border-sky-100/50 dark:border-sky-800/50">
            {categoryObj.icon}
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-md border ${categoryObj.color}`}>
                {categoryObj.name}
              </span>
              {farmName && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-gray-100 dark:border-slate-700">
                  <MapPin size={11} className="text-sky-500 dark:text-sky-400" />
                  {farmName}
                </span>
              )}
              {pondName && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded-md border border-violet-100 dark:border-violet-800/50">
                  <Fish size={11} className="text-violet-500 dark:text-violet-400" />
                  {pondName}
                </span>
              )}
            </div>

            {expense.description ? (
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                {expense.description}
              </p>
            ) : (
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400 italic">
                {categoryObj.name}
              </p>
            )}

            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
              <Calendar size={12} />
              <span>
                {new Date(expense.expense_date).toLocaleDateString("id-ID", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50 dark:border-slate-800">
          <div className="text-left sm:text-right">
            <p className="text-xs text-muted-foreground dark:text-slate-400 font-medium">Nominal</p>
            <p className="text-lg font-extrabold text-sky-600 dark:text-sky-400">
              {formatCurrency(expense.amount)}
            </p>
          </div>

          <div className="relative shrink-0">
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="p-2 rounded-xl text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
            >
              <MoreVertical size={16} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-9 z-20 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 py-1 min-w-[140px]">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setConfirmDelete(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <Trash2 size={14} />
                    Hapus Catatan
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isPending && setConfirmDelete(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/60 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-center font-semibold text-gray-900 dark:text-white text-lg">Hapus Catatan Pengeluaran?</h3>
            <p className="text-center text-sm text-muted-foreground dark:text-slate-400 mt-2">
              Pengeluaran sebesar <strong className="text-gray-900 dark:text-white">{formatCurrency(expense.amount)}</strong> akan dihapus permanen dari laporan keuangan.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <><Loader2 size={15} className="animate-spin" /> Menghapus...</>
                ) : (
                  "Ya, Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
