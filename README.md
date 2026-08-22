This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## AI Tool: getCategoryBreakdown

The spending-insights chat (`/api/chat`) registers one server-side tool that lets the assistant look up real transaction data instead of relying only on the summary baked into its system prompt.

**Name:** `getCategoryBreakdown`

**When it's used:** The model calls this whenever a question needs category-specific totals or individual transaction details — e.g. "how much did I spend on Transport?" or "show me my grocery transactions." Broad questions (total spend, date range, number of expenses) are answered directly from the system prompt overview without needing the tool.

**Input schema (Zod):**

```typescript
z.object({
  category: z
    .string()
    .optional()
    .describe(
      "The expense category to filter by, e.g. 'Groceries', 'Transport'. " +
        "Omit this to get a breakdown across ALL categories."
    ),
})
```

`category` is optional — omitting it returns a breakdown across every category instead of just one.

**Return shape:**

```typescript
type CategoryBreakdownResult = {
  category: string;          // "All Categories" when no filter was given
  totalSpent: number;
  transactionCount: number;
  transactions: {
    date: string;
    description: string;
    amount: number;
  }[];                        // capped at the 10 most recent
};
```

**Files:**
- `src/lib/ai/tools.ts` — schema + `execute` (tool definition only, no rendering logic)
- `src/app/api/chat/route.ts` — registers the tool with `streamText`, reads the raw `expenses` array from the request body (expenses live in the browser via `localStorage`, not on a server-side data source)
- `src/components/chat/tool-call-card.tsx` — renders the tool's 4 lifecycle states (`input-streaming`, `input-available`, `output-available`, `output-error`) as distinct UI, with `output-available` rendering a real table component instead of raw JSON

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
