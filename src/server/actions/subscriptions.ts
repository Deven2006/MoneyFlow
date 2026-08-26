// src/server/actions/subscriptions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreateSubscriptionSchema = z.object({
  name: z.string().min(1, "Subscription name is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  accountId: z.string().min(1, "Please select an account"),
  categoryId: z.string().optional(),
  dueDay: z.number().min(1).max(31, "Due day must be between 1 and 31"),
  frequency: z.enum(["MONTHLY", "YEARLY", "WEEKLY"]).default("MONTHLY"),
});

export async function createSubscriptionAction(data: z.infer<typeof CreateSubscriptionSchema>) {
  try {
    const validated = CreateSubscriptionSchema.parse(data);

    const user = await prisma.user.findFirst({
      where: { email: "demo@moneyflow.app" },
    });
    if (!user) throw new Error("Demo user not found");

    await prisma.recurringTransaction.create({
      data: {
        userId: user.id,
        name: validated.name.trim(),
        amount: validated.amount,
        accountId: validated.accountId,
        categoryId: validated.categoryId || null,
        dueDay: validated.dueDay,
        frequency: validated.frequency,
      },
    });

    revalidatePath("/subscriptions");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create subscription." };
  }
}

export async function markSubscriptionPaidAction(subscriptionId: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "demo@moneyflow.app" },
    });
    if (!user) throw new Error("Unauthorized");

    const sub = await prisma.recurringTransaction.findFirst({
      where: { id: subscriptionId, userId: user.id },
    });
    if (!sub) throw new Error("Subscription not found");

    // 1. Create the actual Expense transaction in the ledger
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "EXPENSE",
        amount: sub.amount,
        accountId: sub.accountId,
        categoryId: sub.categoryId,
        merchant: sub.name,
        notes: `Recurring payment (${sub.frequency.toLowerCase()})`,
        date: new Date(),
      },
    });

    // 2. Update the subscription's lastPaidAt timestamp
    await prisma.recurringTransaction.update({
      where: { id: subscriptionId },
      data: { lastPaidAt: new Date() },
    });

    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/subscriptions");
    revalidatePath("/analytics");
    revalidatePath("/budgets");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to log subscription payment." };
  }
}

export async function deleteSubscriptionAction(subscriptionId: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "demo@moneyflow.app" },
    });
    if (!user) throw new Error("Unauthorized");

    await prisma.recurringTransaction.delete({
      where: { id: subscriptionId, userId: user.id },
    });

    revalidatePath("/subscriptions");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete subscription." };
  }
}