// src/app/page.tsx
import { prisma } from "@/lib/prisma";
import HeroCard from "@/components/dashboard/HeroCard";
import AccountsList from "@/components/dashboard/AccountsList";
import BudgetProgress from "@/components/dashboard/BudgetProgress";
import AddTransactionModalWrapper from "@/components/dashboard/AddTransactionModalWrapper";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await prisma.user.findFirst({
    where: { email: "demo@moneyflow.app" },
    include: {
      accounts: { where: { isArchived: false } },
      categories: { where: { isArchived: false } },
      budgets: {
        where: { month: 8, year: 2026 },
        include: { category: true },
      },
      transactions: {
        orderBy: { date: "desc" },
        take: 10,
        include: { account: true, category: true },
      },
    },
  });

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">No demo user found. Run `npx tsx prisma/seed.ts` first.</p>
      </div>
    );
  }

  // 1. Calculate and serialize account balances into plain JavaScript numbers
  let totalBalance = 0;
  const accountsWithBalances = await Promise.all(
    user.accounts.map(async (acc) => {
      const [incomeSum, expenseSum, outTransfers, inTransfers] = await Promise.all([
        prisma.transaction.aggregate({
          where: { userId: user.id, accountId: acc.id, type: "INCOME" },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId: user.id, accountId: acc.id, type: "EXPENSE" },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId: user.id, accountId: acc.id, type: "TRANSFER" },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId: user.id, toAccountId: acc.id, type: "TRANSFER" },
          _sum: { amount: true },
        }),
      ]);

      const initial = Number(acc.initialBalance);
      const inc = Number(incomeSum._sum.amount || 0);
      const exp = Number(expenseSum._sum.amount || 0);
      const outT = Number(outTransfers._sum.amount || 0);
      const inT = Number(inTransfers._sum.amount || 0);
      const balance = initial + inc - exp + inT - outT;

      totalBalance += balance;

      return {
        id: acc.id,
        name: acc.name,
        type: String(acc.type),
        color: acc.color,
        icon: acc.icon,
        initialBalance: initial,
        balance,
      };
    })
  );

  // 2. Serialize categories into plain objects
  const serializedCategories = user.categories.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    color: c.color,
  }));

  // 3. Serialize budgets into plain objects with numeric amounts
  const serializedBudgets = user.budgets.map((b) => ({
    id: b.id,
    amount: Number(b.amount),
    category: {
      id: b.category.id,
      name: b.category.name,
      icon: b.category.icon,
      color: b.category.color,
    },
  }));

  // 4. Calculate Monthly Totals (August 2026)
  const monthStart = new Date(2026, 7, 1);
  const monthEnd = new Date(2026, 8, 0, 23, 59, 59);

  const [monthlyIncomeAgg, monthlyExpenseAgg] = await Promise.all([
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

  const monthlyIncome = Number(monthlyIncomeAgg._sum.amount || 0);
  const monthlyExpenses = Number(monthlyExpenseAgg._sum.amount || 0);
  const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);

  // 5. Category spending map for budget calculations
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

  const categorySpentMap: Record<string, number> = {};
  for (const item of categoryExpenses) {
    if (item.categoryId) {
      categorySpentMap[item.categoryId] = Number(item._sum.amount || 0);
    }
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] dark:bg-gray-950 pb-28">
      <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
        {/* Hero Card */}
        <HeroCard
          userName={user.name || "User"}
          currency={user.currency}
          totalBalance={totalBalance}
          monthlyIncome={monthlyIncome}
          monthlyExpenses={monthlyExpenses}
          monthlySavings={monthlySavings}
        />

        {/* Account Cards */}
        <AccountsList accounts={accountsWithBalances} />

        {/* Monthly Budget Section */}
        <BudgetProgress
          monthName="August 2026"
          budgets={serializedBudgets}
          categorySpentMap={categorySpentMap}
        />

        {/* Live Recent Transactions */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Recent Transactions</h3>
          <div className="divide-y divide-gray-100 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
            {user.transactions.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">No transactions recorded yet.</p>
            ) : (
              user.transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 first:pt-1 last:pb-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-lg dark:bg-gray-800">
                      {tx.category?.icon || "💸"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {tx.merchant || tx.category?.name || (tx.type === "TRANSFER" ? "Transfer" : "Expense")}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {tx.category?.name || "Transfer"} • {tx.account.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        tx.type === "INCOME"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {tx.type === "INCOME" ? "+" : "-"}₹{Number(tx.amount).toLocaleString("en-IN")}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {new Date(tx.date).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating Modal passing clean plain JSON objects */}
      <AddTransactionModalWrapper
        accounts={accountsWithBalances}
        categories={serializedCategories}
      />
    </main>
  );
}