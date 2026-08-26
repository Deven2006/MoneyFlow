// src/components/dashboard/BudgetProgress.tsx
interface BudgetWithCategory {
  id: string;
  amount: any;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string | null;
  };
}

interface BudgetProgressProps {
  monthName?: string;
  budgets: BudgetWithCategory[];
  categorySpentMap: Record<string, number>;
}

export default function BudgetProgress({
  monthName = "August 2026",
  budgets = [],
  categorySpentMap = {},
}: BudgetProgressProps) {
  const totalBudget = budgets.reduce((acc, b) => acc + Number(b.amount), 0);
  const totalSpent = Object.values(categorySpentMap).reduce((acc, v) => acc + v, 0);
  const percentUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const remaining = Math.max(0, totalBudget - totalSpent);

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{monthName} Budget</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ₹{totalSpent.toLocaleString("en-IN")} spent of ₹{totalBudget.toLocaleString("en-IN")}
          </p>
        </div>
        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-[#6750A4] dark:bg-purple-950 dark:text-purple-300">
          {percentUsed}% Used
        </span>
      </div>

      {/* Main Bar */}
      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percentUsed >= 100 ? "bg-rose-500" : percentUsed >= 75 ? "bg-amber-500" : "bg-[#6750A4]"
          }`}
          style={{ width: `${Math.min(percentUsed, 100)}%` }}
        />
      </div>
      <p className="mt-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-400">
        ₹{remaining.toLocaleString("en-IN")} remaining
      </p>

      {/* Categories */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {budgets.map((b) => {
          const budgetLimit = Number(b.amount);
          const spent = categorySpentMap[b.category.id] || 0;
          const catPercent = budgetLimit > 0 ? Math.round((spent / budgetLimit) * 100) : 0;

          return (
            <div key={b.id} className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {b.category.icon} {b.category.name}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  ₹{spent.toLocaleString("en-IN")} / ₹{budgetLimit.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-full rounded-full ${
                    catPercent >= 100 ? "bg-rose-500" : catPercent >= 80 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(catPercent, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}