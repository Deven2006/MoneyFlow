// src/components/dashboard/AccountsList.tsx
import { Landmark } from "lucide-react";
import { AccountItem } from "@/types";

interface AccountsListProps {
  accounts: AccountItem[];
}

export default function AccountsList({ accounts = [] }: AccountsListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Accounts</h3>
        <span className="text-xs font-semibold text-gray-400">{accounts.length} Active</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-[#6750A4] dark:bg-purple-950 dark:text-purple-300">
                <Landmark className="h-4 w-4" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium capitalize">
                {account.type.toLowerCase()}
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{account.name}</p>
            <p className="mt-1 text-base font-bold text-gray-900 dark:text-gray-100">
              ₹{(account.balance ?? 0).toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}