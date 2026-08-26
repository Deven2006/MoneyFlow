// src/components/categories/CategoryManager.tsx
"use client";

import { useState } from "react";
import { Plus, Archive, X, Loader2, Tag } from "lucide-react";
import { createCategoryAction, archiveCategoryAction } from "@/server/actions/categories";

export interface CategoryCardData {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  transactionCount: number;
}

const PRESET_ICONS = ["🍔", "🛒", "🚗", "🍿", "⚡", "💊", "🎓", "✈️", "🏋️", "🎁", "📱", "☕", "💰", "💼", "📈"];
const PRESET_COLORS = ["#6750A4", "#F97316", "#EC4899", "#3B82F6", "#10B981", "#EAB308", "#8B5CF6", "#64748B"];

export default function CategoryManager({
  categories = [],
}: {
  categories?: CategoryCardData[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🍔");
  const [color, setColor] = useState("#6750A4");
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [isPending, setIsPending] = useState(false);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsPending(true);
    setErrorMsg("");

    const res = await createCategoryAction({
      name,
      icon,
      color,
      type: type as any,
    });

    setIsPending(false);

    if (res.success) {
      setName("");
      setIsModalOpen(false);
    } else {
      setErrorMsg(res.error || "Failed to add category");
    }
  };

  const handleArchive = async (id: string, catName: string) => {
    if (!confirm(`Archive category "${catName}"? Existing transactions will keep their history.`)) return;
    setArchivingId(id);
    await archiveCategoryAction(id);
    setArchivingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
          Categories ({categories.length})
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-[#6750A4] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#58428F] active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="group relative flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-start justify-between">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl shadow-xs"
                style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
              >
                {cat.icon}
              </div>

              <button
                onClick={() => handleArchive(cat.id, cat.name)}
                disabled={archivingId === cat.id}
                className="rounded-full p-1.5 text-gray-300 opacity-0 transition group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                title="Archive category"
              >
                {archivingId === cat.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-500" />
                ) : (
                  <Archive className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            <div className="mt-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{cat.name}</h3>
              <p className="text-[11px] font-medium text-gray-400">
                {cat.transactionCount} {cat.transactionCount === 1 ? "entry" : "entries"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#6750A4]" /> Create New Category
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 rounded-xl bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Gaming, Pets, Subscriptions"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6750A4] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  required
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Select Icon Emoji
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_ICONS.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIcon(i)}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition ${
                        icon === i
                          ? "bg-[#6750A4] text-white ring-2 ring-[#6750A4] ring-offset-2"
                          : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Accent Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-7 w-7 rounded-full transition ${
                        color === c ? "ring-2 ring-gray-900 dark:ring-white ring-offset-2 scale-110" : ""
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending || !name.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#6750A4] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#58428F] active:scale-98 disabled:opacity-50"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Add Category
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}