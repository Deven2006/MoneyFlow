// src/app/subscriptions/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SubscriptionManager, { SerializedSubscription } from "@/components/subscriptions/SubscriptionManager";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const user = await prisma.user.findFirst({
    where: { email: "demo@moneyflow.app" },
    include: {
      accounts: { where: { isArchived: false } },
      categories: { where: { isArchived: false } },
      recurringTransactions: {
        include: {
          account: true,
          category: true,
        },
        orderBy: { dueDay: "asc" },
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

  const serializedSubscriptions: SerializedSubscription[] = (user.recurringTransactions || []).map((sub) => ({
    id: sub.id,
    name: sub.name,
    amount: Number(sub.amount),
    dueDay: sub.dueDay,
    frequency: sub.frequency,
    isActive: sub.isActive,
    lastPaidAt: sub.lastPaidAt ? sub.lastPaidAt.toISOString() : null,
    accountId: sub.accountId,
    accountName: sub.account.name,
    categoryId: sub.categoryId,
    categoryName: sub.category?.name || null,
    categoryIcon: sub.category?.icon || null,
  }));

  const serializedAccounts = user.accounts.map((a) => ({
    id: a.id,
    name: a.name,
    type: String(a.type),
    initialBalance: Number(a.initialBalance),
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
      <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">Recurring Bills & Subscriptions</h1>
        </div>

        <SubscriptionManager
          subscriptions={serializedSubscriptions}
          accounts={serializedAccounts}
          categories={serializedCategories}
        />
      </div>
    </main>
  );
}