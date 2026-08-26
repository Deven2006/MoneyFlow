// src/components/dashboard/HeroCard.tsx
import { ArrowUpRight, ArrowDownRight, PiggyBank } from "lucide-react";

interface HeroCardProps {
  userName?: string;
  currency?: string;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
}

export default function HeroCard({
  userName = "Deven",
  currency = "₹",
  totalBalance,
  monthlyIncome,
  monthlyExpenses,
  monthlySavings,
}: HeroCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6750A4] via-[#5B3F97] to-[#4F2D87] p-6 text-white shadow-xl">
      {/* Soft Glow */}
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

      {/* Greeting Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-purple-200">Good afternoon 👋</p>
          <h2 className="text-xl font-bold tracking-tight">{userName}</h2>
        </div>
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
          {currency} INR
        </span>
      </div>

      {/* Primary Balance */}
      <div className="mt-6">
        <p className="text-xs uppercase tracking-wider text-purple-200 font-semibold">Total Balance</p>
        <div className="flex items-baseline gap-3 mt-1">
          <h1 className="text-4xl font-extrabold tracking-tight">
            ₹{totalBalance.toLocaleString("en-IN")}
          </h1>
          <span className="flex items-center text-xs font-semibold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-md">
            <ArrowUpRight className="h-3 w-3 mr-0.5" />
            +₹{monthlySavings.toLocaleString("en-IN")} this month
          </span>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
        {/* Income */}
        <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
          <div className="flex items-center gap-1 text-purple-200 text-xs mb-1">
            <ArrowDownRight className="h-3.5 w-3.5 text-emerald-400" />
            <span>Income</span>
          </div>
          <p className="text-sm font-bold">₹{monthlyIncome.toLocaleString("en-IN")}</p>
        </div>

        {/* Expenses */}
        <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
          <div className="flex items-center gap-1 text-purple-200 text-xs mb-1">
            <ArrowUpRight className="h-3.5 w-3.5 text-rose-400" />
            <span>Expenses</span>
          </div>
          <p className="text-sm font-bold">₹{monthlyExpenses.toLocaleString("en-IN")}</p>
        </div>

        {/* Savings */}
        <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
          <div className="flex items-center gap-1 text-purple-200 text-xs mb-1">
            <PiggyBank className="h-3.5 w-3.5 text-amber-300" />
            <span>Savings</span>
          </div>
          <p className="text-sm font-bold">₹{monthlySavings.toLocaleString("en-IN")}</p>
        </div>
      </div>
    </div>
  );
}