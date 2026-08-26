// src/app/api/export/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";

    const user = await prisma.user.findFirst({
      where: { email: "demo@moneyflow.app" },
      include: {
        transactions: {
          orderBy: { date: "desc" },
          include: {
            account: true,
            toAccount: true,
            category: true,
          },
        },
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    // 1. JSON Export Option
    if (format === "json") {
      const jsonData = user.transactions.map((t) => ({
        id: t.id,
        date: t.date.toISOString(),
        type: t.type,
        amount: Number(t.amount),
        account: t.account.name,
        toAccount: t.toAccount?.name || null,
        category: t.category?.name || null,
        merchant: t.merchant || "",
        notes: t.notes || "",
      }));

      return new NextResponse(JSON.stringify(jsonData, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="moneyflow-backup-${todayStr}.json"`,
        },
      });
    }

    // 2. CSV Export Option
    const headers = ["Date", "Type", "Amount (INR)", "Merchant / Payee", "Category", "Account", "To Account", "Notes"];
    
    const rows = user.transactions.map((t) => {
      const dateStr = t.date.toISOString().split("T")[0];
      const typeStr = t.type;
      const amountStr = Number(t.amount).toFixed(2);
      const merchantStr = `"${(t.merchant || "").replace(/"/g, '""')}"`;
      const categoryStr = `"${(t.category?.name || "").replace(/"/g, '""')}"`;
      const accountStr = `"${(t.account.name || "").replace(/"/g, '""')}"`;
      const toAccountStr = `"${(t.toAccount?.name || "").replace(/"/g, '""')}"`;
      const notesStr = `"${(t.notes || "").replace(/"/g, '""')}"`;

      return [dateStr, typeStr, amountStr, merchantStr, categoryStr, accountStr, toAccountStr, notesStr].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="moneyflow-ledger-${todayStr}.csv"`,
      },
    });
  } catch (error: any) {
    return new NextResponse(`Export failed: ${error.message}`, { status: 500 });
  }
}