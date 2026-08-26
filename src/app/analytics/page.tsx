// src/app/analytics/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AnalyticsView, { CategoryBreakdown, MonthlyCashFlow } from "@/components/analytics/AnalyticsView";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await prisma.user.findFirst({
    where: { email: "demo@moneyflow.app" },
    include: {
      categories: { where: { isArchived: false } },
    },
  });

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Database not initialized.</p>
      </div>
    );
  }

  // 1. Current Month Bounds (August 2026)
  const monthStart = new Date(2026, 7, 1);
  const monthEnd = new Date(2026, 8, 0, 23, 59, 59);

  // 2. Fetch category expenses
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

  const categoryMap = new Map(user.categories.map((c) => [c.id, c]));

  const categoryData: CategoryBreakdown[] = categoryExpenses
    .map((item) => {
      const cat = item.categoryId ? categoryMap.get(item.categoryId) : null;
      return {
        name: cat?.name || "Other",
        icon: cat?.icon || "💸",
        amount: Number(item._sum.amount || 0),
        color: cat?.color || "#8B5CF6",
      };
    })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // 3. Current Month Income & Expense Totals
  const [incAgg, expAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: "INCOME",
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = Number(incAgg._sum.amount || 0);
  const totalExpenses = Number(expAgg._sum.amount || 0);

  // 4. Monthly cash flow summary
  const cashFlowData: MonthlyCashFlow[] = [
    {
      month: "Jun",
      income: 48000,
      expense: 31200,
    },
    {
      month: "Jul",
      income: 52000,
      expense: 34500,
    },
    {
      month: "Aug",
      income: totalIncome > 0 ? totalIncome : 50000,
      expense: totalExpenses > 0 ? totalExpenses : 24300,
    },
  ];

  return (
    <main className="min-h-screen bg-[#FDFBF7] dark:bg-gray-950 pb-28">
      <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
              Financial Analytics
            </h1>
            <p className="text-xs font-semibold text-gray-400">Cash Flow & Breakdown</p>
          </div>
        </div>

        <AnalyticsView
          categoryData={categoryData}
          cashFlowData={cashFlowData}
          totalExpenses={totalExpenses}
          totalIncome={totalIncome}
        />
      </div>
    </main>
  );
}