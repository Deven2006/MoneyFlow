// src/components/accounts/AccountManager.tsx
"use client";

import { useState } from "react";
import { Plus, Landmark, Wallet, CreditCard, PiggyBank, Archive, X, Loader2 } from "lucide-react";
import { createAccountAction, archiveAccountAction } from "@/server/actions/accounts";

export interface AccountDetail {
  id: string;
  name: string;
  type: string;
  initialBalance: number;
  balance: number;
  color?: string | null;
  icon?: string | null;
  transactionCount: number;
}

const typeIcons: Record<string, any> = {
  BANK: Landmark,
  CASH: Wallet,
  CREDIT_CARD: CreditCard,
  SAVINGS: PiggyBank,
  INVESTMENT: PiggyBank,
};

export default function AccountManager({
  accounts = [],
}: {
  accounts?: AccountDetail[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"BANK" | "CASH" | "CREDIT_CARD" | "SAVINGS">("BANK");
  const [initialBalance, setInitialBalance] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsPending(true);
    setErrorMsg("");

    const res = await createAccountAction({
      name,
      type,
      initialBalance: parseFloat(initialBalance) || 0,
    });

    setIsPending(false);

    if (res.success) {
      setName("");
      setInitialBalance("");
      setIsModalOpen(false);
    } else {
      setErrorMsg(res.error || "Failed to create account");
    }
  };

  const handleArchive = async (id: string, accName: string) => {
    if (!confirm(`Are you sure you want to archive "${accName}"?`)) return;
    setArchivingId(id);
    await archiveAccountAction(id);
    setArchivingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Your Accounts</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-[#6750A4] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#58428F] active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(accounts || []).length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400 dark:border-gray-800">
            No active accounts found. Click &quot;Add Account&quot; to create your first wallet or bank account.
          </div>
        ) : (
          accounts.map((acc) => {
            const IconComponent = typeIcons[acc.type] || Landmark;

            return (
              <div
                key={acc.id}
                className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-[#6750A4] dark:bg-purple-950 dark:text-purple-300">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{acc.name}</h3>
                      <p className="text-xs font-semibold text-gray-400 capitalize">{acc.type.toLowerCase()}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleArchive(acc.id, acc.name)}
                    disabled={archivingId === acc.id}
                    className="rounded-full p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition"
                    title="Archive Account"
                  >
                    {archivingId === acc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                    ) : (
                      <Archive className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="mt-5 border-t border-gray-100 pt-3 dark:border-gray-800 flex items-end justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Current Balance</p>
                    <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                      ₹{acc.balance.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-gray-400">
                    {acc.transactionCount} {acc.transactionCount === 1 ? "activity" : "activities"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Add New Account</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., ICICI Bank, Amazon Pay, Petty Cash"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6750A4] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Account Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="BANK">Bank Account</option>
                  <option value="SAVINGS">Savings Account</option>
                  <option value="CASH">Cash Wallet</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Opening / Starting Balance (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6750A4] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              <button
                type="submit"
                disabled={isPending || !name.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#6750A4] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#58428F] active:scale-98 disabled:opacity-50"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}