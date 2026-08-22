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
  category: string;
  totalSpent: number;
  transactionCount: number;
  transactions: { date: string; description: string; amount: number }[];
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

      const totalSpent = filtered.reduce((sum, e) => sum + e.amount, 0);

      return {
        category: category ?? "All Categories",
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
