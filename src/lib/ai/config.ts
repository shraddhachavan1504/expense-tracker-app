/**
 * lib/ai/config.ts
 *
 * Single source of truth for the spending-insights assistant's
 * model settings and system prompt. FE-07 extends this route handler,
 * so keep everything AI-behavior-related in this one file — nothing
 * prompt-related should live inside the route handler itself.
 */

// Anthropic model to use. Sonnet is the right default for a chat
// feature like this: fast enough to stream comfortably, smart enough
// to do real arithmetic reasoning over the expense summary.
export const MODEL = "openai/gpt-oss-20b";

// Keep responses tight. A spending-insights answer should read like
// a sentence or two plus maybe a short list — not a report. Capping
// tokens also caps latency, which matters for a chat UI.
export const MAX_TOKENS = 600;

/**
 * Shape of the data the client sends alongside each message.
 * NOTE: this is a *summary*, not the raw expense array. Computing
 * it happens on the client (see lib/expenses/summarize.ts) so the
 * request body stays small regardless of how many expenses exist.
 */
export interface ExpenseSummary {
  totalSpend: number;
  currency: string;
  dateRange: { from: string; to: string };
  expenseCount: number;
  byCategory: { category: string; total: number; count: number }[];
  recentExpenses: { date: string; category: string; amount: number; description: string }[];
}

/**
 * Builds the system prompt for a given request. Takes the expense
 * summary as an argument (rather than hardcoding it) so the same
 * config module works whether this runs against a real user's data
 * or a demo dataset for the reviewer.
 */
export function buildSystemPrompt(summary: ExpenseSummary): string {
  return `You are a spending-insights assistant inside a personal expense tracker app.

Your job: help the user understand their own spending by answering questions
about the data below. You are NOT a general financial advisor — decline
politely and redirect if asked for investment advice, tax advice, or
anything unrelated to the data provided.

Rules:
- Base every claim on the data below. Never invent numbers.
- If the data can't answer the question (e.g. asks about a date range
  outside what's provided), say so plainly instead of guessing.
- Keep answers short: 1-3 sentences, or a brief list for breakdowns.
- Use the currency symbol from the data below, not $  by default.
- When you cite a number, make sure it's actually in the data.

Current expense data (as of this conversation):
- Total spend: ${summary.currency}${summary.totalSpend.toFixed(2)}
- Date range: ${summary.dateRange.from} to ${summary.dateRange.to}
- Number of expenses: ${summary.expenseCount}

By category:
${summary.byCategory
  .map((c) => `  - ${c.category}: ${summary.currency}${c.total.toFixed(2)} (${c.count} transactions)`)
  .join("\n")}

Most recent expenses:
${summary.recentExpenses
  .map((e) => `  - ${e.date} | ${e.category} | ${summary.currency}${e.amount.toFixed(2)} | ${e.description}`)
  .join("\n")}`;
}
