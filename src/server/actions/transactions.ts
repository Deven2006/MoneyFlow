// src/server/actions/transactions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { TransactionType } from "@prisma/client";

const CreateTransactionSchema = z.object({
  type: z.nativeEnum(TransactionType),
  amount: z.number().positive("Amount must be greater than 0"),
  accountId: z.string().min(1, "Please select an account"),
  categoryId: z.string().optional(),
  toAccountId: z.string().optional(),
  merchant: z.string().optional(),
  notes: z.string().optional(),
});

export async function createTransactionAction(data: z.infer<typeof CreateTransactionSchema>) {
  try {
    const validated = CreateTransactionSchema.parse(data);

    const user = await prisma.user.findFirst({
      where: { email: "demo@moneyflow.app" },
    });

    if (!user) {
      return { success: false, error: "Demo user not found. Please run seed script." };
    }

    const newTx = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: validated.type,
        amount: validated.amount,
        accountId: validated.accountId,
        categoryId: validated.type === "EXPENSE" ? validated.categoryId : null,
        toAccountId: validated.type === "TRANSFER" ? validated.toAccountId : null,
        merchant: validated.merchant || null,
        notes: validated.notes || null,
      },
      include: {
        account: true,
        category: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/transactions");

    return {
      success: true,
      transaction: {
        ...newTx,
        amount: Number(newTx.amount),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to save transaction",
    };
  }
}

// Add to src/server/actions/transactions.ts

const UpdateTransactionSchema = z.object({
  id: z.string().min(1, "Transaction ID is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  accountId: z.string().min(1, "Account is required"),
  toAccountId: z.string().optional(),
  categoryId: z.string().optional(),
  merchant: z.string().optional(),
  notes: z.string().optional(),
  date: z.string().optional(),
});

export async function updateTransactionAction(data: z.infer<typeof UpdateTransactionSchema>) {
  try {
    const validated = UpdateTransactionSchema.parse(data);

    const user = await prisma.user.findFirst({
      where: { email: "demo@moneyflow.app" },
    });
    if (!user) throw new Error("Unauthorized");

    const existing = await prisma.transaction.findFirst({
      where: { id: validated.id, userId: user.id },
    });
    if (!existing) throw new Error("Transaction not found");

    await prisma.transaction.update({
      where: { id: validated.id },
      data: {
        amount: validated.amount,
        accountId: validated.accountId,
        toAccountId: validated.toAccountId || null,
        categoryId: validated.categoryId || null,
        merchant: validated.merchant || null,
        notes: validated.notes || null,
        date: validated.date ? new Date(validated.date) : existing.date,
      },
    });

    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/budgets");
    revalidatePath("/analytics");
    revalidatePath("/accounts");

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to update transaction",
    };
  }
}

export async function deleteTransactionAction(transactionId: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "demo@moneyflow.app" },
    });
    if (!user) throw new Error("Unauthorized");

    await prisma.transaction.delete({
      where: {
        id: transactionId,
        userId: user.id,
      },
    });

    revalidatePath("/");
    revalidatePath("/transactions");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete transaction." };
  }
}