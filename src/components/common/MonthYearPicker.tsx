// src/components/common/MonthYearPicker.tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface MonthYearPickerProps {
  currentMonth: number; // 1 - 12
  currentYear: number;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function MonthYearPicker({
  currentMonth,
  currentYear,
}: MonthYearPickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleNavigate = (newMonth: number, newYear: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", newMonth.toString());
    params.set("year", newYear.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePrev = () => {
    if (currentMonth === 1) {
      handleNavigate(12, currentYear - 1);
    } else {
      handleNavigate(currentMonth - 1, currentYear);
    }
  };

  const handleNext = () => {
    if (currentMonth === 12) {
      handleNavigate(1, currentYear + 1);
    } else {
      handleNavigate(currentMonth + 1, currentYear);
    }
  };

  return (
    <div className="flex items-center gap-1.5 rounded-2xl border border-gray-100 bg-white p-1 shadow-xs dark:border-gray-800 dark:bg-gray-900">
      <button
        onClick={handlePrev}
        className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition active:scale-95"
        aria-label="Previous Month"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-1.5 px-2">
        <Calendar className="h-3.5 w-3.5 text-[#6750A4] dark:text-purple-400" />
        <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
          {MONTH_NAMES[currentMonth - 1]} {currentYear}
        </span>
      </div>

      <button
        onClick={handleNext}
        className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition active:scale-95"
        aria-label="Next Month"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}