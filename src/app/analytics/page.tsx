// src/app/analytics/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AnalyticsView, { CategoryBreakdown, MonthlyCashFlow } from "@/components/analytics/AnalyticsView";
import MonthYearPicker from "@/components/common/MonthYearPicker";

export const dynamic = "force-dynamic";

interface AnalyticsPageProps {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const resolvedParams = await searchParams;
  const now = new Date();
  const selectedMonth = resolvedParams.month ? parseInt(resolvedParams.month, 10) : now.getMonth() + 1;
  const selectedYear = resolvedParams.year ? parseInt(resolvedParams.year, 10) : now.getFullYear();

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

  // 1. Date Bounds for Selected Month
  const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
  const monthEnd = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);

  // 2. Fetch category expenses for selected month
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

  // 4. Generate 4-month rolling cash flow summary
  const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const cashFlowData: MonthlyCashFlow[] = [];

  for (let i = 3; i >= 0; i--) {
    const targetDate = new Date(selectedYear, selectedMonth - 1 - i, 1);
    const m = targetDate.getMonth() + 1;
    const y = targetDate.getFullYear();
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const [incomeData, expenseData] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId: user.id, type: "INCOME", date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId: user.id, type: "EXPENSE", date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
    ]);

    cashFlowData.push({
      month: `${monthNamesShort[m - 1]}`,
      income: Number(incomeData._sum.amount || 0),
      expense: Number(expenseData._sum.amount || 0),
    });
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] dark:bg-gray-950 pb-28">
      <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

          <MonthYearPicker currentMonth={selectedMonth} currentYear={selectedYear} />
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