// src/components/subscriptions/SubscriptionManager.tsx
"use client";

import { useState } from "react";
import { Plus, Calendar, CheckCircle, Trash2, X, Loader2, Clock, AlertCircle } from "lucide-react";
import { createSubscriptionAction, markSubscriptionPaidAction, deleteSubscriptionAction } from "@/server/actions/subscriptions";
import { AccountItem, CategoryItem } from "@/types";

export interface SerializedSubscription {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  frequency: string;
  isActive: boolean;
  lastPaidAt: string | null;
  accountId: string;
  accountName: string;
  categoryId?: string | null;
  categoryName?: string | null;
  categoryIcon?: string | null;
}

interface SubscriptionManagerProps {
  subscriptions?: SerializedSubscription[];
  accounts?: AccountItem[];
  categories?: CategoryItem[];
}

export default function SubscriptionManager({
  subscriptions = [],
  accounts = [],
  categories = [],
}: SubscriptionManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("1");
  const [frequency, setFrequency] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [isPending, setIsPending] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const currentDay = new Date().getDate();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const totalMonthlyCost = subscriptions.reduce((sum, s) => {
    return sum + (s.frequency === "YEARLY" ? s.amount / 12 : s.amount);
  }, 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const numDueDay = parseInt(dueDay, 10);
    if (!name.trim() || !numAmount || !numDueDay) return;

    setIsPending(true);
    setErrorMsg("");

    const res = await createSubscriptionAction({
      name,
      amount: numAmount,
      accountId: accountId || accounts[0]?.id || "",
      categoryId: categoryId || undefined,
      dueDay: numDueDay,
      frequency,
    });

    setIsPending(false);

    if (res.success) {
      setName("");
      setAmount("");
      setIsModalOpen(false);
    } else {
      setErrorMsg(res.error || "Failed to create subscription");
    }
  };

  const handleMarkPaid = async (id: string) => {
    setPayingId(id);
    await markSubscriptionPaidAction(id);
    setPayingId(null);
  };

  const handleDelete = async (id: string, subName: string) => {
    if (!confirm(`Delete recurring subscription for "${subName}"?`)) return;
    setDeletingId(id);
    await deleteSubscriptionAction(id);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Monthly Subscriptions</p>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-0.5">
              ₹{Math.round(totalMonthlyCost).toLocaleString("en-IN")}
              <span className="text-sm font-normal text-gray-400 ml-1">/ month</span>
            </h2>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-full bg-[#6750A4] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#58428F] active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Subscription</span>
          </button>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Active Subscriptions & Bills</h3>

        {subscriptions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400 dark:border-gray-800">
            No recurring subscriptions tracked yet. Click &quot;Add Subscription&quot; to set up monthly bills like Wi-Fi, Rent, or Netflix.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {subscriptions.map((sub) => {
              // Check if paid in the current calendar month
              const lastPaid = sub.lastPaidAt ? new Date(sub.lastPaidAt) : null;
              const isPaidThisMonth =
                lastPaid &&
                lastPaid.getMonth() === currentMonth &&
                lastPaid.getFullYear() === currentYear;

              // Calculate days remaining
              let daysLeft = sub.dueDay - currentDay;
              if (daysLeft < 0) daysLeft += 30; // wrapped to next cycle

              return (
                <div
                  key={sub.id}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-xl dark:bg-purple-950">
                        {sub.categoryIcon || "🔁"}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{sub.name}</h4>
                        <p className="text-xs text-gray-400">
                          {sub.categoryName || "Subscription"} • {sub.accountName}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-extrabold text-gray-900 dark:text-white">
                        ₹{sub.amount.toLocaleString("en-IN")}
                      </p>
                      <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-300 uppercase">
                        {sub.frequency}
                      </span>
                    </div>
                  </div>

                  {/* Due Status and Actions */}
                  <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs">
                      {isPaidThisMonth ? (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Paid this month
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                          <Clock className="h-3.5 w-3.5" />
                          Due on {sub.dueDay}th ({daysLeft === 0 ? "Today" : `${daysLeft}d left`})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isPaidThisMonth && (
                        <button
                          onClick={() => handleMarkPaid(sub.id)}
                          disabled={payingId === sub.id}
                          className="flex items-center gap-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 text-xs font-bold text-[#6750A4] dark:text-purple-300 hover:bg-purple-100 transition active:scale-95 disabled:opacity-50"
                        >
                          {payingId === sub.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5" />
                          )}
                          <span>Pay Now</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(sub.id, sub.name)}
                        disabled={deletingId === sub.id}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition"
                      >
                        {deletingId === sub.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-500" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Add Subscription</h3>
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
                  Subscription / Bill Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Netflix, Wi-Fi, Gym, Rent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6750A4] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="649"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6750A4] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Due Day of Month
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6750A4] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Account
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Billing Cycle
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isPending || !name.trim() || !amount}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#6750A4] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#58428F] active:scale-98 disabled:opacity-50"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Subscription
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}