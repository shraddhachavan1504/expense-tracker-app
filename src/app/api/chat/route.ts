/**
 * app/api/chat/route.ts
 *
 * The only file in this app allowed to touch ANTHROPIC_API_KEY.
 * Receives the chat history + an expense summary, streams Claude's
 * reply back as a message stream that useChat() on the client
 * understands natively.
 *
 * FE-07 update: now also registers the category-breakdown tool. The
 * raw expense list is sent by the client (spending-chat.tsx) in the
 * same request body as the summary — this route has no server-side
 * data source of its own, since expenses live in the browser
 * (localStorage), not on disk or in a database.
 */

import { groq } from "@ai-sdk/groq";
import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  type UIMessage,
} from "ai";
import { MODEL, MAX_TOKENS, buildSystemPrompt, type ExpenseSummary } from "@/lib/ai/config";
import { createGetCategoryBreakdownTool } from "@/lib/ai/tools";
import type { Expense } from "@/lib/expenses/summarize";

// Streaming responses shouldn't be cached, and Node's runtime handles
// long-lived SSE connections more predictably than the edge runtime
// for this SDK version.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface ChatRequestBody {
  messages: UIMessage[];
  expenseSummary: ExpenseSummary;
  expenses: Expense[];
}

export async function POST(req: Request) {
  const { messages, expenseSummary, expenses }: ChatRequestBody = await req.json();

  // Basic guardrail: don't call the model with no data and no
  // question. Cheap to check, saves a wasted API call.
  if (!messages?.length) {
    return new Response("No messages provided", { status: 400 });
  }

  // convertToModelMessages is async in this SDK version, so it must be
  // awaited before being handed to streamText.
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: groq(MODEL),
    system: buildSystemPrompt(expenseSummary),
    messages: modelMessages,
    maxOutputTokens: MAX_TOKENS,
    tools: {
      getCategoryBreakdown: createGetCategoryBreakdownTool(expenses ?? []),
    },
    // Without this, streamText stops after ONE step — meaning the
    // model could call the tool but never gets a turn to respond
    // to the tool's result in plain text. stepCountIs(5) lets it:
    // (1) call the tool, (2) read the result, (3) write a reply —
    // with headroom if it ever needs a second tool call.
    stopWhen: stepCountIs(5),
    abortSignal: req.signal, // lets the client's stop() actually cancel the upstream call
  });

  // toUIMessageStreamResponse gives useChat() the typed message-part
  // stream it expects out of the box — no manual SSE parsing needed.
  return result.toUIMessageStreamResponse();
}