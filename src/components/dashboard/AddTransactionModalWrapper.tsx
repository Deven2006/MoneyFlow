// src/components/dashboard/AddTransactionModalWrapper.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import AddTransactionModal from "@/components/dashboard/AddTransactionModal";
import { AccountItem, CategoryItem } from "@/types";

interface AddTransactionModalWrapperProps {
  accounts?: AccountItem[];
  categories?: CategoryItem[];
}

export default function AddTransactionModalWrapper({
  accounts = [],
  categories = [],
}: AddTransactionModalWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-[#6750A4] px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-purple-900/30 transition hover:bg-[#58428F] active:scale-95 z-40"
        aria-label="Add Transaction"
      >
        <Plus className="h-5 w-5" />
        <span>Add Expense</span>
      </button>

      <AddTransactionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        accounts={accounts}
        categories={categories}
      />
    </>
  );
}