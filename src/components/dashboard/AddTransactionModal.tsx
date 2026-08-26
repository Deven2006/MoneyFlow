// src/components/dashboard/AddTransactionModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { X, Check, ArrowRightLeft, ArrowDownRight, ArrowUpRight, Loader2 } from "lucide-react";
import { createTransactionAction } from "@/server/actions/transactions";
import { AccountItem, CategoryItem } from "@/types";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts?: AccountItem[];
  categories?: CategoryItem[];
}

export default function AddTransactionModal({
  isOpen,
  onClose,
  accounts = [],
  categories = [],
}: AddTransactionModalProps) {
  const [type, setType] = useState<"EXPENSE" | "INCOME" | "TRANSFER">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(categories?.[0]?.id || "");
  const [accountId, setAccountId] = useState(accounts?.[0]?.id || "");
  const [toAccountId, setToAccountId] = useState(accounts?.[1]?.id || accounts?.[0]?.id || "");
  const [merchant, setMerchant] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (!categoryId && categories.length > 0) setCategoryId(categories[0].id);
      if (!accountId && accounts.length > 0) setAccountId(accounts[0].id);
      if (!toAccountId && accounts.length > 1) setToAccountId(accounts[1].id);

      const timer = setTimeout(() => amountInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, categories, accounts]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsSaved(false);
    setErrorMsg("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    setIsPending(true);
    setErrorMsg("");

    const res = await createTransactionAction({
      type,
      amount: numAmount,
      accountId,
      toAccountId: type === "TRANSFER" ? toAccountId : undefined,
      categoryId: type === "EXPENSE" ? categoryId : undefined,
      merchant: merchant.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setIsPending(false);

    if (res.success) {
      setIsSaved(true);
      setTimeout(() => {
        setAmount("");
        setMerchant("");
        setNotes("");
        setIsSaved(false);
        onClose();
      }, 700);
    } else {
      setErrorMsg(res.error || "Failed to save transaction.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-lg overflow-hidden rounded-t-[28px] sm:rounded-[28px] bg-white dark:bg-gray-900 p-6 shadow-2xl transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {isSaved ? "Saved!" : "Add Transaction"}
          </h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 rounded-xl bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-600 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {isSaved ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 animate-bounce">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Transaction recorded!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-5">
            {/* Type Selector */}
            <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-gray-100 dark:bg-gray-800 p-1">
              <button
                type="button"
                onClick={() => setType("EXPENSE")}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition ${
                  type === "EXPENSE"
                    ? "bg-white dark:bg-gray-700 text-rose-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType("INCOME")}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition ${
                  type === "INCOME"
                    ? "bg-white dark:bg-gray-700 text-emerald-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                <ArrowDownRight className="h-3.5 w-3.5" />
                Income
              </button>
              <button
                type="button"
                onClick={() => setType("TRANSFER")}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition ${
                  type === "TRANSFER"
                    ? "bg-white dark:bg-gray-700 text-purple-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Transfer
              </button>
            </div>

            {/* Amount Field */}
            <div className="rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 p-4 text-center">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </label>
              <div className="flex items-center justify-center mt-1">
                <span className="text-3xl font-bold text-gray-500 dark:text-gray-400 mr-1">₹</span>
                <input
                  ref={amountInputRef}
                  type="number"
                  step="any"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-48 bg-transparent text-4xl font-extrabold text-gray-900 dark:text-white placeholder:text-gray-300 focus:outline-none text-center"
                  required
                />
              </div>
            </div>

            {/* Category Chips */}
            {type === "EXPENSE" && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const isSelected = categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryId(cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                          isSelected
                            ? "bg-[#6750A4] text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200"
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Account & Payee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  {type === "TRANSFER" ? "From Account" : "Account"}
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              {type === "TRANSFER" ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    To Account
                  </label>
                  <select
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none"
                  >
                    {accounts
                      .filter((acc) => acc.id !== accountId)
                      .map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Merchant / Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Swiggy, Uber"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending || !amount || parseFloat(amount) <= 0}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#6750A4] py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#58428F] active:scale-[0.98] disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save {type === "EXPENSE" ? "Expense" : type === "INCOME" ? "Income" : "Transfer"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}