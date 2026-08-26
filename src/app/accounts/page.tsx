// src/app/accounts/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AccountManager, { AccountDetail } from "@/components/accounts/AccountManager";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const user = await prisma.user.findFirst({
    where: { email: "demo@moneyflow.app" },
    include: {
      accounts: { where: { isArchived: false } },
    },
  });

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Database not initialized.</p>
      </div>
    );
  }

  const accountsWithDetails: AccountDetail[] = await Promise.all(
    (user.accounts || []).map(async (acc) => {
      const [incomeSum, expenseSum, outTransfers, inTransfers, txCount] = await Promise.all([
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
        prisma.transaction.count({
          where: {
            userId: user.id,
            OR: [{ accountId: acc.id }, { toAccountId: acc.id }],
          },
        }),
      ]);

      const initial = Number(acc.initialBalance);
      const inc = Number(incomeSum._sum.amount || 0);
      const exp = Number(expenseSum._sum.amount || 0);
      const outT = Number(outTransfers._sum.amount || 0);
      const inT = Number(inTransfers._sum.amount || 0);
      const balance = initial + inc - exp + inT - outT;

      return {
        id: acc.id,
        name: acc.name,
        type: String(acc.type),
        initialBalance: initial,
        balance,
        color: acc.color,
        icon: acc.icon,
        transactionCount: txCount,
      };
    })
  );

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
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">Accounts & Wallets</h1>
        </div>

        <AccountManager accounts={accountsWithDetails} />
      </div>
    </main>
  );
}