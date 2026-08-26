// src/lib/mockData.ts

export const mockUser = {
  name: "Deven",
  currency: "₹",
};

export const mockSummary = {
  totalBalance: 72450,
  monthlyChange: 4200,
  income: 50000,
  expenses: 32450,
  savings: 17550,
};

export const mockAccounts = [
  { id: "1", name: "HDFC Bank", type: "Savings", balance: 32500, color: "bg-blue-600" },
  { id: "2", name: "SBI Savings", type: "Savings", balance: 24950, color: "bg-emerald-600" },
  { id: "3", name: "Cash Wallet", type: "Cash", balance: 5000, color: "bg-amber-600" },
  { id: "4", name: "ICICI Salary", type: "Salary", balance: 10000, color: "bg-orange-600" },
];

export const mockBudget = {
  month: "August 2026",
  totalBudget: 30000,
  totalSpent: 18450,
  categories: [
    { id: "c1", name: "Food", spent: 4250, budget: 6000, icon: "🍔", color: "#F97316" },
    { id: "c2", name: "Shopping", spent: 4900, budget: 5000, icon: "🛍️", color: "#EC4899" },
    { id: "c3", name: "Transport", spent: 1800, budget: 3000, icon: "🚕", color: "#3B82F6" },
    { id: "c4", name: "Bills", spent: 5000, budget: 5000, icon: "💡", color: "#EAB308" },
  ],
};

export const mockTransactions = [
  { id: "t1", title: "Swiggy", category: "Food", account: "HDFC Bank", amount: 450, type: "EXPENSE", time: "Today, 1:30 PM", icon: "🍔" },
  { id: "t2", title: "Amazon", category: "Shopping", account: "HDFC Bank", amount: 1299, type: "EXPENSE", time: "Today, 10:15 AM", icon: "🛍️" },
  { id: "t3", title: "Salary Credited", category: "Salary", account: "ICICI Salary", amount: 50000, type: "INCOME", time: "Aug 1, 9:00 AM", icon: "💰" },
];