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

// The schema is intentionally small. Every field here is a field the
// model can hallucinate a value for — category is the only one that
// matters for this tool, so that's the only one we ask for.
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
  category: string; // "All Categories" when no filter was given
  totalSpent: number;
  transactionCount: number;
  transactions: { date: string; description: string; amount: number }[];
};

/**
 * Builds the tool, closing over the current request's expense array
 * so `execute` can filter it. This is a factory (not a static export)
 * because the expense data arrives per-request in the request body —
 * see route.ts for where this gets called.
 */
export function createGetCategoryBreakdownTool(expenses: Expense[]) {
  return tool({
    description:
      "Get a spending breakdown for a specific category, or all categories " +
      "if none is specified. Returns the total spent, transaction count, " +
      "and the individual transactions.",
    inputSchema: getCategoryBreakdownSchema,
    execute: async ({ category }): Promise<CategoryBreakdownResult> => {
  console.log("🔧 Tool called with category:", category); // TEMP — remove after testing

  await new Promise((resolve) => setTimeout(resolve, 600));

      const filtered = category
        ? expenses.filter((e) => e.category.toLowerCase() === category.toLowerCase())
        : expenses;

      // A category that doesn't exist in the data isn't a crash —
      // it's a legitimate empty result. The UI's output-available
      // state needs to handle transactionCount: 0 gracefully.
      const totalSpent = filtered.reduce((sum, e) => sum + e.amount, 0);

      return {
        category: category ?? "All Categories",
        totalSpent,
        transactionCount: filtered.length,
        transactions: filtered
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 10) // cap what comes back — the model doesn't need 500 rows
          .map((e) => ({ date: e.date, description: e.description, amount: e.amount })),
      };
    },
  });
}