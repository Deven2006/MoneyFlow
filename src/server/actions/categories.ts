// src/server/actions/categories.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { TransactionType } from "@prisma/client";

const CreateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().default("#6750A4"),
  type: z.nativeEnum(TransactionType).default("EXPENSE"),
});

export async function createCategoryAction(data: z.infer<typeof CreateCategorySchema>) {
  try {
    const validated = CreateCategorySchema.parse(data);

    const user = await prisma.user.findFirst({
      where: { email: "demo@moneyflow.app" },
    });
    if (!user) throw new Error("Demo user not found");

    const category = await prisma.category.create({
      data: {
        userId: user.id,
        name: validated.name.trim(),
        icon: validated.icon,
        color: validated.color,
        type: validated.type,
      },
    });

    revalidatePath("/categories");
    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/budgets");
    revalidatePath("/analytics");

    return { success: true, category };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create category." };
  }
}

export async function archiveCategoryAction(categoryId: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "demo@moneyflow.app" },
    });
    if (!user) throw new Error("Unauthorized");

    await prisma.category.update({
      where: { id: categoryId, userId: user.id },
      data: { isArchived: true },
    });

    revalidatePath("/categories");
    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/budgets");
    revalidatePath("/analytics");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to archive category." };
  }
}