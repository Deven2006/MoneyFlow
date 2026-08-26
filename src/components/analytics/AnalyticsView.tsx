// src/components/analytics/AnalyticsView.tsx
"use client";

import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, PieChart as PieIcon, BarChart3 } from "lucide-react";

export interface CategoryBreakdown {
  name: string;
  icon: string;
  amount: number;
  color: string;
}

export interface MonthlyCashFlow {
  month: string;
  income: number;
  expense: number;
}

interface AnalyticsViewProps {
  categoryData: CategoryBreakdown[];
  cashFlowData: MonthlyCashFlow[];
  totalExpenses: number;
  totalIncome: number;
}

const DEFAULT_COLORS = ["#F97316", "#EC4899", "#3B82F6", "#EAB308", "#8B5CF6", "#10B981", "#64748B"];

export default function AnalyticsView({
  categoryData = [],
  cashFlowData = [],
  totalExpenses = 0,
  totalIncome = 0,
}: AnalyticsViewProps) {
  const savingsRate =
    totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top High-Level Metrics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span>Total Inflow</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
            ₹{totalIncome.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
            <TrendingDown className="h-4 w-4 text-rose-500" />
            <span>Total Outflow</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
            ₹{totalExpenses.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
            <PieIcon className="h-4 w-4 text-[#6750A4]" />
            <span>Savings Rate</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {savingsRate}%
          </p>
        </div>
      </div>

      {/* Chart 1: Category Spending Donut Chart */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieIcon className="h-5 w-5 text-[#6750A4]" />
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Expense by Category
            </h3>
          </div>
          <span className="text-xs font-semibold text-gray-400">August 2026</span>
        </div>

        {categoryData.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No expense data recorded yet for this period.
          </div>
        ) : (
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Spent"]}
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      borderRadius: "12px",
                      color: "#fff",
                      border: "none",
                      fontSize: "12px",
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Legend List */}
            <div className="space-y-3">
              {categoryData.map((item, idx) => {
                const pct =
                  totalExpenses > 0 ? Math.round((item.amount / totalExpenses) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
                        }}
                      />
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {item.icon} {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 dark:text-gray-100">
                        ₹{item.amount.toLocaleString("en-IN")}
                      </span>
                      <span className="w-10 text-right text-gray-400">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Chart 2: Cash Flow (Income vs Expense) */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#6750A4]" />
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Cash Flow Trend
            </h3>
          </div>
          <span className="text-xs font-semibold text-gray-400">Monthly View</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} />
              <Tooltip
                formatter={(value: any, name: any) => [
                  `₹${Number(value).toLocaleString("en-IN")}`,
                  name === "income" ? "Income" : "Expense",
                ]}
                contentStyle={{
                  backgroundColor: "#1F2937",
                  borderRadius: "12px",
                  color: "#fff",
                  border: "none",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="income" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar dataKey="expense" fill="#F43F5E" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}