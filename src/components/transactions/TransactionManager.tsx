// src/components/transactions/TransactionManager.tsx
"use client";

import { useState, useMemo } from "react";
import { Search, Trash2, ArrowUpRight, ArrowDownRight, ArrowRightLeft, Filter, Loader2 } from "lucide-react";
import { deleteTransactionAction } from "@/server/actions/transactions";
import { AccountItem, CategoryItem } from "@/types";

export interface SerializedTransaction {
  id: string;
  type: "EXPENSE" | "INCOME" | "TRANSFER";
  amount: number;
  merchant: string | null;
  notes: string | null;
  date: string;
  accountId: string;
  account: { id: string; name: string };
  toAccount?: { id: string; name: string } | null;
  categoryId?: string | null;
  category?: { id: string; name: string; icon: string; color: string | null } | null;
}

interface TransactionManagerProps {
  initialTransactions: SerializedTransaction[];
  accounts: AccountItem[];
  categories: CategoryItem[];
}

export default function TransactionManager({
  initialTransactions,
  accounts,
  categories,
}: TransactionManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedAccount, setSelectedAccount] = useState<string>("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter transactions dynamically
  const filteredTransactions = useMemo(() => {
    return initialTransactions.filter((tx) => {
      // 1. Search filter
      const matchesSearch =
        (tx.merchant?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (tx.notes?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (tx.category?.name.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        tx.amount.toString().includes(searchTerm);

      // 2. Type filter
      const matchesType = selectedType === "ALL" || tx.type === selectedType;

      // 3. Category filter
      const matchesCategory =
        selectedCategory === "ALL" || tx.categoryId === selectedCategory;

      // 4. Account filter
      const matchesAccount =
        selectedAccount === "ALL" || tx.accountId === selectedAccount;

      return matchesSearch && matchesType && matchesCategory && matchesAccount;
    });
  }, [initialTransactions, searchTerm, selectedType, selectedCategory, selectedAccount]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    setDeletingId(id);
    await deleteTransactionAction(id);
    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by merchant, category, amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-3 gap-2">
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="EXPENSE">Expenses</option>
            <option value="INCOME">Income</option>
            <option value="TRANSFER">Transfers</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          {/* Account Filter */}
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="ALL">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-gray-100 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No transactions match your search criteria.
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-50 text-xl dark:bg-gray-800">
                  {tx.category?.icon || (tx.type === "TRANSFER" ? "🔄" : "💸")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {tx.merchant || tx.category?.name || (tx.type === "TRANSFER" ? "Account Transfer" : "Transaction")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {tx.category?.name ? `${tx.category.name} • ` : ""}
                    {tx.type === "TRANSFER" && tx.toAccount
                      ? `${tx.account.name} → ${tx.toAccount.name}`
                      : tx.account.name}
                  </p>
                  {tx.notes && (
                    <p className="text-[11px] text-gray-400 italic mt-0.5">{tx.notes}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${
                      tx.type === "INCOME"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : tx.type === "TRANSFER"
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : ""}
                    ₹{tx.amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {new Date(tx.date).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(tx.id)}
                  disabled={deletingId === tx.id}
                  className="rounded-full p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition"
                  title="Delete transaction"
                >
                  {deletingId === tx.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}