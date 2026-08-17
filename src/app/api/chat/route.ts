/**
 * app/api/chat/route.ts
 *
 * The only file in this app allowed to touch ANTHROPIC_API_KEY.
 * Receives the chat history + an expense summary, streams Claude's
 * reply back as a message stream that useChat() on the client
 * understands natively.
 */

import { groq } from "@ai-sdk/groq";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { MODEL, MAX_TOKENS, buildSystemPrompt, type ExpenseSummary } from "@/lib/ai/config";

// Streaming responses shouldn't be cached, and Node's runtime handles
// long-lived SSE connections more predictably than the edge runtime
// for this SDK version.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface ChatRequestBody {
  messages: UIMessage[];
  expenseSummary: ExpenseSummary;
}

export async function POST(req: Request) {
  const { messages, expenseSummary }: ChatRequestBody = await req.json();

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
    abortSignal: req.signal, // lets the client's stop() actually cancel the upstream call
  });

  // toUIMessageStreamResponse gives useChat() the typed message-part
  // stream it expects out of the box — no manual SSE parsing needed.
  return result.toUIMessageStreamResponse();
}