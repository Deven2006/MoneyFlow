// src/server/actions/budgets.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const UpsertBudgetSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
  amount: z.number().positive("Budget amount must be greater than 0"),
});

export async function upsertBudgetAction(data: z.infer<typeof UpsertBudgetSchema>) {
  try {
    const validated = UpsertBudgetSchema.parse(data);

    const user = await prisma.user.findFirst({
      where: { email: "demo@moneyflow.app" },
    });
    if (!user) throw new Error("Demo user not found");

    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId: user.id,
        categoryId: validated.categoryId,
        month: validated.month,
        year: validated.year,
      },
    });

    if (existingBudget) {
      await prisma.budget.update({
        where: { id: existingBudget.id },
        data: { amount: validated.amount },
      });
    } else {
      await prisma.budget.create({
        data: {
          userId: user.id,
          categoryId: validated.categoryId,
          month: validated.month,
          year: validated.year,
          amount: validated.amount,
        },
      });
    }

    revalidatePath("/");
    revalidatePath("/budgets");

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to set budget",
    };
  }
}