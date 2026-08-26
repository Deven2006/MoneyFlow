// src/components/dashboard/AddTransactionModalWrapper.tsx
"use client";

import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import AddTransactionModal from "@/components/dashboard/AddTransactionModal";
import QuickPasteModal from "@/components/dashboard/QuickPasteModal";
import { AccountItem, CategoryItem } from "@/types";

interface AddTransactionModalWrapperProps {
  accounts?: AccountItem[];
  categories?: CategoryItem[];
}

export default function AddTransactionModalWrapper({
  accounts = [],
  categories = [],
}: AddTransactionModalWrapperProps) {
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isQuickPasteOpen, setIsQuickPasteOpen] = useState(false);

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2.5 z-40">
        <button
          onClick={() => setIsQuickPasteOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-200 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition"
          aria-label="Paste SMS"
        >
          <Sparkles className="h-4 w-4 text-[#6750A4]" />
          <span>Paste SMS</span>
        </button>

        <button
          onClick={() => setIsManualOpen(true)}
          className="flex items-center gap-2 rounded-full bg-[#6750A4] px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-purple-900/30 transition hover:bg-[#58428F] active:scale-95"
          aria-label="Add Transaction"
        >
          <Plus className="h-5 w-5" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Manual Modal */}
      <AddTransactionModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        accounts={accounts}
        categories={categories}
      />

      {/* Quick Paste Modal */}
      <QuickPasteModal
        isOpen={isQuickPasteOpen}
        onClose={() => setIsQuickPasteOpen(false)}
        accounts={accounts}
        categories={categories}
      />
    </>
  );
}