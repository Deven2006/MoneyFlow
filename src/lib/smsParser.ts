// src/lib/smsParser.ts

export interface ParsedTransactionData {
  amount?: number;
  merchant?: string;
  type: "EXPENSE" | "INCOME" | "TRANSFER";
  accountSnippet?: string;
}

export function parseBankSms(text: string): ParsedTransactionData {
  const clean = text.trim();
  let amount: number | undefined;
  let merchant: string | undefined;
  let type: "EXPENSE" | "INCOME" | "TRANSFER" = "EXPENSE";
  let accountSnippet: string | undefined;

  // 1. Detect Amount (e.g. Rs. 450.00, INR 1,200, Rs 500)
  const amountMatch = clean.match(/(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (amountMatch && amountMatch[1]) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ""));
  }

  // 2. Detect Type (Debited vs Credited)
  if (/\b(credited|received|deposited|refunded)\b/i.test(clean)) {
    type = "INCOME";
  } else if (/\b(debited|spent|paid|transferred|withdrawn)\b/i.test(clean)) {
    type = "EXPENSE";
  }

  // 3. Detect Merchant / Payee
  // Matches: "to VPA xyz@okaxis", "to SWIGGY", "at AMAZON", "Info: UPI/P2M/..."
  const merchantMatch =
    clean.match(/(?:to\s+(?:VPA\s+)?|at\s+|towards\s+)([A-Za-z0-9\s._-]+?)(?:\s+(?:on|ref|via|avl|using|balance|bal|upi)|\.|$)/i) ||
    clean.match(/Info:\s*UPI\/[^\/]+\/([^\/]+)/i);

  if (merchantMatch && merchantMatch[1]) {
    const rawMerchant = merchantMatch[1].trim();
    if (rawMerchant.length > 1 && !/^(account|a\/c|card|your)$/i.test(rawMerchant)) {
      merchant = rawMerchant.slice(0, 30);
    }
  }

  // 4. Detect Account snippet (e.g. A/c **1234, ending 5678)
  const accMatch = clean.match(/(?:A\/c|Acct|Account|Card)(?:\s+no\.?)?\s*(?:ending\s+with|\*{2,}|x{2,})?\s*(\d{3,4})/i);
  if (accMatch && accMatch[1]) {
    accountSnippet = accMatch[1];
  }

  return {
    amount,
    merchant,
    type,
    accountSnippet,
  };
}