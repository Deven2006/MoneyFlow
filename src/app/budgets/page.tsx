// src/app/budgets/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BudgetManager, { CategoryBudgetDetail } from "@/components/budgets/BudgetManager";
import AddTransactionModalWrapper from "@/components/dashboard/AddTransactionModalWrapper";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const user = await prisma.user.findFirst({
    where: { email: "demo@moneyflow.app" },
    include: {
      accounts: { where: { isArchived: false } },
      categories: { where: { isArchived: false } },
      budgets: {
        where: { month: 8, year: 2026 },
        include: { category: true },
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

  // Calculate actual spending per category for August 2026
  const monthStart = new Date(2026, 7, 1);
  const monthEnd = new Date(2026, 8, 0, 23, 59, 59);

  const categoryExpenses = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId: user.id,
      type: "EXPENSE",
      categoryId: { not: null },
      date: { gte: monthStart, lte: monthEnd },
    },
    _sum: { amount: true },
  });

  const spentMap: Record<string, number> = {};
  for (const item of categoryExpenses) {
    if (item.categoryId) {
      spentMap[item.categoryId] = Number(item._sum.amount || 0);
    }
  }

  // Build budget details
  const budgetDetails: CategoryBudgetDetail[] = user.categories.map((cat) => {
    const matchedBudget = user.budgets.find((b) => b.categoryId === cat.id);
    return {
      id: matchedBudget?.id,
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      budgetAmount: matchedBudget ? Number(matchedBudget.amount) : 0,
      spentAmount: spentMap[cat.id] || 0,
    };
  });

  const serializedCategories = user.categories.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    color: c.color,
  }));

  const serializedAccounts = user.accounts.map((a) => ({
    id: a.id,
    name: a.name,
    type: String(a.type),
    color: a.color,
    icon: a.icon,
  }));

  return (
    <main className="min-h-screen bg-[#FDFBF7] dark:bg-gray-950 pb-28">
      <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">Monthly Budgets</h1>
              <p className="text-xs font-semibold text-gray-400">August 2026</p>
            </div>
          </div>
        </div>

        <BudgetManager
          categories={serializedCategories}
          budgetDetails={budgetDetails}
          currentMonth={8}
          currentYear={2026}
        />
      </div>

      <AddTransactionModalWrapper
        accounts={serializedAccounts}
        categories={serializedCategories}
      />
    </main>
  );
}