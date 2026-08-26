// src/components/budgets/BudgetManager.tsx
"use client";

import { useState } from "react";
import { Plus, Edit2, Check, X, Loader2, AlertCircle } from "lucide-react";
import { upsertBudgetAction } from "@/server/actions/budgets";
import { CategoryItem } from "@/types";

export interface CategoryBudgetDetail {
  id?: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  budgetAmount: number;
  spentAmount: number;
}

interface BudgetManagerProps {
  categories: CategoryItem[];
  budgetDetails: CategoryBudgetDetail[];
  currentMonth: number;
  currentYear: number;
}

export default function BudgetManager({
  categories = [],
  budgetDetails = [],
  currentMonth = 8,
  currentYear = 2026,
}: BudgetManagerProps) {
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const totalBudget = budgetDetails.reduce((sum, b) => sum + b.budgetAmount, 0);
  const totalSpent = budgetDetails.reduce((sum, b) => sum + b.spentAmount, 0);
  const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const handleOpenEdit = (category: CategoryItem, currentBudget: number) => {
    setEditingCategory(category);
    setAmountInput(currentBudget > 0 ? currentBudget.toString() : "");
    setErrorMsg("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const numAmount = parseFloat(amountInput);
    if (!numAmount || numAmount <= 0) return;

    setIsPending(true);
    setErrorMsg("");

    const res = await upsertBudgetAction({
      categoryId: editingCategory.id,
      month: currentMonth,
      year: currentYear,
      amount: numAmount,
    });

    setIsPending(false);

    if (res.success) {
      setEditingCategory(null);
      setAmountInput("");
    } else {
      setErrorMsg(res.error || "Failed to update budget");
    }
  };

  return (
    <div className="space-y-6">
      {/* Month Overview Summary Card */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Budget</p>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">
              ₹{totalBudget.toLocaleString("en-IN")}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Spent</p>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">
              ₹{totalSpent.toLocaleString("en-IN")}
            </h2>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallPercentage >= 100
                ? "bg-rose-500"
                : overallPercentage >= 80
                ? "bg-amber-500"
                : "bg-[#6750A4]"
            }`}
            style={{ width: `${Math.min(overallPercentage, 100)}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs font-medium text-gray-500">
          <span>{overallPercentage}% of total limit allocated</span>
          <span>₹{Math.max(0, totalBudget - totalSpent).toLocaleString("en-IN")} remaining</span>
        </div>
      </div>

      {/* Categories Budget Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Category Budgets</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {categories.map((cat) => {
            const detail = budgetDetails.find((b) => b.categoryId === cat.id);
            const budgetAmt = detail?.budgetAmount || 0;
            const spentAmt = detail?.spentAmount || 0;
            const pct = budgetAmt > 0 ? Math.round((spentAmt / budgetAmt) * 100) : 0;
            const isOver = budgetAmt > 0 && spentAmt > budgetAmt;

            return (
              <div
                key={cat.id}
                className="relative rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-lg dark:bg-gray-800">
                        {cat.icon}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{cat.name}</h4>
                        <p className="text-[11px] text-gray-400">
                          {budgetAmt > 0
                            ? `₹${spentAmt.toLocaleString("en-IN")} / ₹${budgetAmt.toLocaleString("en-IN")}`
                            : "No limit set"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(cat, budgetAmt)}
                      className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition"
                      title="Set / Edit Budget"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  {budgetAmt > 0 && (
                    <div className="mt-3.5">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOver
                              ? "bg-rose-500"
                              : pct >= 80
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px]">
                        <span className={isOver ? "font-bold text-rose-500 flex items-center gap-1" : "text-gray-400"}>
                          {isOver && <AlertCircle className="h-3 w-3" />}
                          {pct}% used
                        </span>
                        <span className="text-gray-400">
                          {isOver
                            ? `₹${(spentAmt - budgetAmt).toLocaleString("en-IN")} over`
                            : `₹${(budgetAmt - spentAmt).toLocaleString("en-IN")} left`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Budget Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingCategory(null)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>{editingCategory.icon}</span> Set {editingCategory.name} Budget
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 rounded-xl bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Monthly Limit (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 5000"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6750A4] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isPending || !amountInput}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#6750A4] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#58428F] active:scale-98 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Save Budget Limit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}