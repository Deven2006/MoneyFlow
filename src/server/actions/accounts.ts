// src/server/actions/accounts.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AccountType } from "@prisma/client";

const CreateAccountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.nativeEnum(AccountType),
  initialBalance: z.number().min(0, "Initial balance cannot be negative"),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export async function createAccountAction(data: z.infer<typeof CreateAccountSchema>) {
  try {
    const validated = CreateAccountSchema.parse(data);

    const user = await prisma.user.findFirst({
      where: { email: "demo@moneyflow.app" },
    });
    if (!user) throw new Error("Demo user not found");

    const newAccount = await prisma.account.create({
      data: {
        userId: user.id,
        name: validated.name.trim(),
        type: validated.type,
        initialBalance: validated.initialBalance,
        color: validated.color || "#6750A4",
        icon: validated.icon || "Landmark",
      },
    });

    revalidatePath("/");
    revalidatePath("/accounts");
    revalidatePath("/transactions");

    return {
      success: true,
      account: {
        ...newAccount,
        initialBalance: Number(newAccount.initialBalance),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to create account",
    };
  }
}

export async function archiveAccountAction(accountId: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "demo@moneyflow.app" },
    });
    if (!user) throw new Error("Unauthorized");

    await prisma.account.update({
      where: { id: accountId, userId: user.id },
      data: { isArchived: true },
    });

    revalidatePath("/");
    revalidatePath("/accounts");
    revalidatePath("/transactions");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to archive account." };
  }
}