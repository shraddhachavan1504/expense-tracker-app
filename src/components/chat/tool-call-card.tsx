/**
 * components/chat/tool-call-card.tsx
 *
 * Renders the getCategoryBreakdown tool's lifecycle as four visually
 * distinct states, per FE-07's brief:
 *   - input-streaming : the model is deciding what to call this with
 *   - input-available  : the call is about to run, input is final
 *   - output-available : real result -> rendered as a table
 *   - output-error      : a designed failure state, not a crash
 */

import type { UIMessage } from "ai";

type MessagePart = UIMessage["parts"][number];

export function ToolCallCard({ part }: { part: MessagePart }) {
  if (!("state" in part)) return null;

  switch (part.state) {
    case "input-streaming":
      return (
        <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#1E3AF2]" />
          Deciding what to look up…
        </div>
      );

    case "input-available":
      return (
        <div className="flex items-center gap-2 rounded-xl border border-[#1E3AF2]/40 bg-[#1E3AF2]/10 px-4 py-3 text-sm text-[#F7F6F2]">
          <span className="h-2 w-2 rounded-full bg-[#1E3AF2] animate-bounce" />
          Looking up{" "}
          <span className="font-semibold">
            {part.input?.category ? part.input.category : "all categories"}
          </span>
          …
        </div>
      );

    case "output-error":
      return (
        <div className="rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          <p className="font-semibold">Couldn't complete that lookup</p>
          <p className="mt-1 text-red-400/80">
            {part.errorText ?? "Something went wrong reaching the expense data. Try asking again."}
          </p>
        </div>
      );

    case "output-available":
      if (!part.output) return null;
      return <CategoryBreakdownTable result={part.output} />;

    default:
      return null;
  }
}

function CategoryBreakdownTable({ result }: { result: any }) {
  const { category, totalSpent, transactionCount, transactions } = result;

  if (transactionCount === 0) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-400">
        No transactions found for <span className="text-[#F7F6F2] font-semibold">{category}</span>.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
      <div className="flex items-baseline justify-between border-b border-neutral-800 px-4 py-3">
        <span className="text-sm font-semibold text-[#F7F6F2]">{category}</span>
        <span className="text-sm">
          <span className="text-[#FFD400] font-bold">₹{totalSpent.toFixed(2)}</span>
          <span className="text-neutral-500"> · {transactionCount} transactions</span>
        </span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-neutral-500 border-b border-neutral-800">
            <th className="text-left font-medium px-4 py-2">Date</th>
            <th className="text-left font-medium px-4 py-2">Description</th>
            <th className="text-right font-medium px-4 py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t: any, i: number) => (
            <tr key={i} className="border-b border-neutral-900 last:border-0">
              <td className="px-4 py-2 text-neutral-400">{t.date}</td>
              <td className="px-4 py-2 text-[#F7F6F2]">{t.description}</td>
              <td className="px-4 py-2 text-right text-[#F7F6F2]">₹{t.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
