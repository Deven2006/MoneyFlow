// prisma/seed.ts
import "dotenv/config";
import { PrismaClient, TransactionType, AccountType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Create or get Demo User
  const user = await prisma.user.upsert({
    where: { email: "demo@moneyflow.app" },
    update: {},
    create: {
      email: "demo@moneyflow.app",
      name: "Deven",
      currency: "INR",
    },
  });

  // 2. Clean existing records for a fresh start (optional)
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.budget.deleteMany({ where: { userId: user.id } });
  await prisma.category.deleteMany({ where: { userId: user.id } });
  await prisma.account.deleteMany({ where: { userId: user.id } });

  // 3. Create Default Accounts
  const hdfc = await prisma.account.create({
    data: {
      userId: user.id,
      name: "HDFC Bank",
      type: AccountType.BANK,
      initialBalance: 32500,
    },
  });

  const sbi = await prisma.account.create({
    data: {
      userId: user.id,
      name: "SBI Savings",
      type: AccountType.SAVINGS,
      initialBalance: 24950,
    },
  });

  await prisma.account.create({
    data: {
      userId: user.id,
      name: "Cash Wallet",
      type: AccountType.CASH,
      initialBalance: 5000,
    },
  });

  // 4. Create Default Categories
  const categoriesData = [
    { name: "Food", icon: "🍔", color: "#F97316" },
    { name: "Shopping", icon: "🛍️", color: "#EC4899" },
    { name: "Transport", icon: "🚕", color: "#3B82F6" },
    { name: "Bills", icon: "💡", color: "#EAB308" },
    { name: "Entertainment", icon: "🎬", color: "#8B5CF6" },
    { name: "Groceries", icon: "🛒", color: "#10B981" },
  ];

  const createdCategories: Record<string, string> = {};

  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: {
        userId: user.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: TransactionType.EXPENSE,
      },
    });
    createdCategories[cat.name] = created.id;
  }

  // 5. Create August 2026 Budgets
  if (createdCategories["Food"]) {
    await prisma.budget.create({
      data: {
        userId: user.id,
        categoryId: createdCategories["Food"],
        month: 8,
        year: 2026,
        amount: 6000,
      },
    });
  }

  if (createdCategories["Shopping"]) {
    await prisma.budget.create({
      data: {
        userId: user.id,
        categoryId: createdCategories["Shopping"],
        month: 8,
        year: 2026,
        amount: 5000,
      },
    });
  }

  // 6. Create Initial Demo Transactions
  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        accountId: hdfc.id,
        categoryId: createdCategories["Food"],
        amount: 450,
        type: TransactionType.EXPENSE,
        merchant: "Swiggy",
        notes: "Dinner",
      },
      {
        userId: user.id,
        accountId: hdfc.id,
        categoryId: createdCategories["Shopping"],
        amount: 1299,
        type: TransactionType.EXPENSE,
        merchant: "Amazon",
        notes: "Supplies",
      },
      {
        userId: user.id,
        accountId: sbi.id,
        categoryId: createdCategories["Transport"],
        amount: 230,
        type: TransactionType.EXPENSE,
        merchant: "Uber",
      },
    ],
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });