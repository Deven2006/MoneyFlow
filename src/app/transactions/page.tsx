// src/app/transactions/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TransactionManager, { SerializedTransaction } from "@/components/transactions/TransactionManager";
import AddTransactionModalWrapper from "@/components/dashboard/AddTransactionModalWrapper";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const user = await prisma.user.findFirst({
    where: { email: "demo@moneyflow.app" },
    include: {
      accounts: { where: { isArchived: false } },
      categories: { where: { isArchived: false } },
      transactions: {
        orderBy: { date: "desc" },
        include: {
          account: { select: { id: true, name: true } },
          toAccount: { select: { id: true, name: true } },
          category: { select: { id: true, name: true, icon: true, color: true } },
        },
      },
    },
  });

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Database not initialized.</p>
      </div>
    );
  }

  // Serialize Prisma objects to plain types
  const serializedTransactions: SerializedTransaction[] = user.transactions.map((tx) => ({
    id: tx.id,
    type: tx.type as "EXPENSE" | "INCOME" | "TRANSFER",
    amount: Number(tx.amount),
    merchant: tx.merchant,
    notes: tx.notes,
    date: tx.date.toISOString(),
    accountId: tx.accountId,
    account: tx.account,
    toAccount: tx.toAccount,
    categoryId: tx.categoryId,
    category: tx.category,
  }));

  const serializedAccounts = user.accounts.map((a) => ({
    id: a.id,
    name: a.name,
    type: String(a.type),
    color: a.color,
    icon: a.icon,
  }));

  const serializedCategories = user.categories.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    color: c.color,
  }));

  return (
    <main className="min-h-screen bg-[#FDFBF7] dark:bg-gray-950 pb-28">
      <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6 lg:px-8 space-y-5">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
              All Transactions
            </h1>
          </div>
          <span className="text-xs font-semibold text-gray-400">
            {serializedTransactions.length} Total
          </span>
        </div>

        {/* Search, Filter & List Manager */}
        <TransactionManager
          initialTransactions={serializedTransactions}
          accounts={serializedAccounts}
          categories={serializedCategories}
        />
      </div>

      {/* Floating Add Action */}
      <AddTransactionModalWrapper
        accounts={serializedAccounts}
        categories={serializedCategories}
      />
    </main>
  );
}