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

## FE-AA2 — Your First 3D Experience on the Web

### What I built

A scroll-triggered 3D bar chart visualizing spending by category, built into
the Reports page. Built with React Three Fiber (Three.js).

- Bars are generated from real expense data via `summarizeExpenses()`,
  the same summarization function used by the AI chat feature above —
  no separate/duplicate data source.
- Bars stay flat until the section scrolls into view, then grow in
  smoothly (IntersectionObserver + per-frame lerp via `useFrame`) —
  satisfies the "meaningful interaction beyond orbiting" requirement.
- Orthographic camera used instead of perspective, so bars render as
  true rectangles rather than tapering/slanted shapes — the right
  camera choice for a chart-style visual.
- Reduced-motion fallback: checks `prefers-reduced-motion` and swaps
  in a plain HTML/CSS bar chart (same data, same colors, no WebGL,
  no animation) when the user has that OS setting enabled.
- Canvas is lazy-loaded (`next/dynamic`, `ssr: false`) so the 3D
  bundle only loads on the Reports page, not app-wide.

### Live URL

[https://expense-tracker-app-8do5.vercel.app/reports](https://expense-tracker-app-8do5.vercel.app/reports)

### Perf note (FE-10 lens)

- **Bundle size impact:** adding the 3D scene added ~410 kB to the
  `/reports` route specifically (565 kB transferred vs. 155 kB on
  `/expenses`, a page with no 3D). Because the Canvas is lazy-loaded
  and SSR-disabled, that cost is isolated to `/reports` — no other
  route in the app pays for it.
- **INP (Interaction to Next Paint):** 51ms during the scroll-triggered
  animation, well under Google's 200ms "good" threshold — the
  animation doesn't block the browser from responding to input.
- **CLS (Cumulative Layout Shift):** 0 — nothing jumps around as the
  scene loads or animates in.

### What I'd add with more time

- A live FPS overlay measurement across a low-end device, not just
  desktop Chrome
- Click-to-highlight a bar to show that category's individual
  transactions
- Smoother color transitions when data updates in real time rather
  than only on page load

### Notable bug fixed along the way

Testing on mobile initially failed silently (blank white chart area,
no console errors). Root cause turned out to be Next.js's dev server
blocking cross-origin requests to `_next/*` resources by default when
accessed via a LAN IP instead of `localhost` — not a bug in the 3D
code itself. Fixed by adding `allowedDevOrigins` to `next.config.mjs`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.