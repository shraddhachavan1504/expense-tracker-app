/**
 * lib/ai/tools.ts
 *
 * FE-07's server-side tool: lets the assistant look up a spending
 * breakdown by category instead of relying only on the summary baked
 * into the system prompt. The model decides WHEN to call this —
 * e.g. "how much did I spend on transport?" triggers it with
 * category: "Transport"; "give me a full breakdown" triggers it with
 * no category filter.
 *
 * FE-08 update: added a `found` flag so the UI can distinguish
 * "zero matching transactions" from a normal result, instead of
 * silently rendering an empty table/chart.
 *
 * FE-08 fix: category display now uses `||` instead of `??` when
 * falling back to "All Categories" — the model sometimes calls the
 * tool with category: "" (empty string) rather than omitting the
 * field, and `??` only falls back on null/undefined, not "". `||`
 * falls back on any falsy value, including "".
 *
 * Keep this file's job narrow: schema + execute, nothing about
 * rendering. The UI side lives in components/chat/tool-call-card.tsx.
 */

import { tool } from "ai";
import { z } from "zod";
import type { Expense } from "@/lib/expenses/summarize";

const getCategoryBreakdownSchema = z.object({
  category: z
    .string()
    .optional()
    .describe(
      "The expense category to filter by, e.g. 'Groceries', 'Transport'. " +
        "Omit this to get a breakdown across ALL categories."
    ),
});

export type CategoryBreakdownResult = {
  found: boolean;
  category: string;
  totalSpent: number;
  transactionCount: number;
  transactions: { date: string; description: string; amount: number }[];
  message?: string;
};

export function createGetCategoryBreakdownTool(expenses: Expense[]) {
  return tool({
    description:
      "Get a spending breakdown for a specific category, or all categories " +
      "if none is specified. Returns the total spent, transaction count, " +
      "and the individual transactions.",
    inputSchema: getCategoryBreakdownSchema,
    execute: async ({ category }): Promise<CategoryBreakdownResult> => {
      const filtered = category
        ? expenses.filter((e) => e.category.toLowerCase() === category.toLowerCase())
        : expenses;

      // FE-08 edge case: category filter matched nothing (e.g. user
      // asked about "Travel" but every expense is tagged "Transport").
      // Return a distinct shape instead of a zeroed-out result that
      // looks like a real (but boring) answer.
      if (filtered.length === 0) {
        return {
          found: false,
          category: category || "All Categories",
          totalSpent: 0,
          transactionCount: 0,
          transactions: [],
          message: category
            ? `No expenses found in the "${category}" category.`
            : "No expenses recorded yet.",
        };
      }

      const totalSpent = filtered.reduce((sum, e) => sum + e.amount, 0);

      return {
        found: true,
        category: category || "All Categories",
        totalSpent,
        transactionCount: filtered.length,
        transactions: filtered
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 10)
          .map((e) => ({ date: e.date, description: e.description, amount: e.amount })),
      };
    },
  });
}