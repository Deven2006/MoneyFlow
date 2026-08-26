// src/app/categories/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CategoryManager, { CategoryCardData } from "@/components/categories/CategoryManager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const user = await prisma.user.findFirst({
    where: { email: "demo@moneyflow.app" },
    include: {
      categories: {
        where: { isArchived: false },
        include: {
          _count: { select: { transactions: true } },
        },
        orderBy: { name: "asc" },
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

  const serializedCategories: CategoryCardData[] = user.categories.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    color: c.color || "#6750A4",
    type: String(c.type),
    transactionCount: c._count.transactions,
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
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">Manage Categories</h1>
        </div>

        <CategoryManager categories={serializedCategories} />
      </div>
    </main>
  );
}