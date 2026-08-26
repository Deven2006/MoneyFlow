// src/components/dashboard/QuickPasteModal.tsx
"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, X, AlertCircle } from "lucide-react";
import { parseBankSms } from "@/lib/smsParser";
import { AccountItem, CategoryItem } from "@/types";
import { createTransactionAction } from "@/server/actions/transactions";

interface QuickPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AccountItem[];
  categories: CategoryItem[];
}

export default function QuickPasteModal({
  isOpen,
  onClose,
  accounts = [],
  categories = [],
}: QuickPasteModalProps) {
  const [smsText, setSmsText] = useState("");
  const [parsed, setParsed] = useState<ReturnType<typeof parseBankSms> | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || "");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleParse = () => {
    if (!smsText.trim()) return;
    const result = parseBankSms(smsText);
    setParsed(result);

    // Auto-match account if snippet found
    if (result.accountSnippet) {
      const match = accounts.find((a) => a.name.includes(result.accountSnippet!));
      if (match) setSelectedAccountId(match.id);
    }
  };

  const handleConfirmSave = async () => {
    if (!parsed || !parsed.amount) return;
    setIsSaving(true);
    setErrorMsg("");

    const res = await createTransactionAction({
      type: parsed.type,
      amount: parsed.amount,
      accountId: selectedAccountId || accounts[0]?.id || "",
      categoryId: parsed.type === "EXPENSE" ? selectedCategoryId || categories[0]?.id : undefined,
      merchant: parsed.merchant || "UPI Transaction",
      notes: "Auto-parsed from SMS",
    });

    setIsSaving(false);

    if (res.success) {
      setSmsText("");
      setParsed(null);
      onClose();
    } else {
      setErrorMsg(res.error || "Failed to record transaction.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-[#6750A4] dark:bg-purple-950 dark:text-purple-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Quick Paste UPI / SMS
            </h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {!parsed ? (
          <div className="mt-4 space-y-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Paste your transaction SMS from HDFC, SBI, ICICI, or UPI apps to extract details instantly.
            </p>
            <textarea
              rows={4}
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              placeholder="e.g. Sent Rs.450.00 from HDFC Bank A/C **1234 to SWIGGY on 26-08-26..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6750A4] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              onClick={handleParse}
              disabled={!smsText.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#6750A4] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#58428F] active:scale-98 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>Parse SMS</span>
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl bg-purple-50/60 p-4 border border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-300">
                  Detected {parsed.type}
                </span>
                <span className="text-2xl font-black text-gray-900 dark:text-white">
                  ₹{parsed.amount?.toLocaleString("en-IN") || "0"}
                </span>
              </div>

              {parsed.merchant && (
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Payee: <span className="text-gray-900 dark:text-white">{parsed.merchant}</span>
                </p>
              )}
            </div>

            {/* Account Selector */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Account
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
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
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setParsed(null)}
                className="w-1/3 rounded-2xl border border-gray-200 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Re-paste
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={isSaving || !parsed.amount}
                className="w-2/3 rounded-2xl bg-[#6750A4] py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#58428F] active:scale-98 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Confirm & Save Expense"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}