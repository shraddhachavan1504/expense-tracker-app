/**
 * lib/expenses/summarize.ts
 *
 * Turns your app's raw expense list into the compact ExpenseSummary
 * shape the AI route expects. Runs on the client, before the request
 * is sent — this is what keeps the payload small no matter how many
 * expenses the user has logged.
 *
 * Adjust the `Expense` type below to match whatever shape your
 * Dashboard/Expense List screens already use.
 */

import type { ExpenseSummary } from "@/lib/ai/config";

export interface Expense {
  id: string;
  date: string; // ISO date string, e.g. "2026-08-01"
  category: string;
  amount: number;
  description: string;
}

const CURRENCY = "₹"; // change to match your app's currency

export function summarizeExpenses(expenses: Expense[]): ExpenseSummary {
  if (expenses.length === 0) {
    return {
      totalSpend: 0,
      currency: CURRENCY,
      dateRange: { from: "", to: "" },
      expenseCount: 0,
      byCategory: [],
      recentExpenses: [],
    };
  }

  const sorted = [...expenses].sort((a, b) => a.date.localeCompare(b.date));
  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category without a library — Object.entries + reduce
  // is enough here and avoids pulling in lodash for one grouping.
  const categoryMap = new Map<string, { total: number; count: number }>();
  for (const e of expenses) {
    const existing = categoryMap.get(e.category) ?? { total: 0, count: 0 };
    categoryMap.set(e.category, {
      total: existing.total + e.amount,
      count: existing.count + 1,
    });
  }

  const byCategory = Array.from(categoryMap.entries())
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.total - a.total); // biggest spend first

  // Only send the 15 most recent — enough for the AI to spot
  // patterns without ballooning the request on large histories.
  const recentExpenses = [...sorted]
    .reverse()
    .slice(0, 15)
    .map((e) => ({
      date: e.date,
      category: e.category,
      amount: e.amount,
      description: e.description,
    }));

  return {
    totalSpend,
    currency: CURRENCY,
    dateRange: { from: sorted[0].date, to: sorted[sorted.length - 1].date },
    expenseCount: expenses.length,
    byCategory,
    recentExpenses,
  };
}