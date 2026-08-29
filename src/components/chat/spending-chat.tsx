"use client";

/**
 * components/chat/spending-chat.tsx
 *
 * The capstone's central AI interaction: a streaming spending-insights
 * chat. Wire this into your Dashboard or Reports screen.
 *
 * Props: pass your app's live expense list in; this component
 * computes the summary and re-sends it with every message, so the
 * assistant always reasons over current data.
 *
 * FE-08 update: added error state handling. useChat's status can be
 * 'error' (network failure, mid-stream failure, rate limit, etc.) —
 * previously nothing checked for this, so failures happened silently
 * with no feedback to the user. `regenerate()` retries only the last
 * message, not the whole conversation.
 */

import { useState, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { summarizeExpenses, type Expense } from "@/lib/expenses/summarize";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { MessageBubble } from "./message-bubble";

interface SpendingChatProps {
  expenses: Expense[];
}

export function SpendingChat({ expenses }: SpendingChatProps) {
  const [input, setInput] = useState("");
  const [retrying, setRetrying] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  // `dependency` here is the running text length across all messages —
  // it changes on every streamed chunk, which is exactly the signal
  // the auto-scroll hook needs to "follow" a live stream.
  const totalTextLength = messages.reduce(
    (sum, m) => sum + m.parts.filter((p) => p.type === "text").reduce((s, p) => s + ("text" in p ? p.text.length : 0), 0),
    0
  );
  const { containerRef, isAtBottom, scrollToBottom } = useAutoScroll<HTMLDivElement>(totalTextLength);

  // status is one of: 'ready' | 'submitted' | 'streaming' | 'error'
  const isBusy = status === "submitted" || status === "streaming";
  const showThinkingIndicator =
    status === "submitted" ||
    (status === "streaming" &&
      messages[messages.length - 1]?.role === "assistant" &&
      !messages[messages.length - 1]?.parts.some((p) => p.type === "text" && p.text.length > 0));

 async function handleRetry() {
  if (retrying) return;
  setRetrying(true);
  try {
    await regenerate({
      body: { expenseSummary: summarizeExpenses(expenses), expenses },
    });
  } finally {
    setRetrying(false);
  }
}

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isBusy) return;

   sendMessage(
  { text: trimmed },
  { body: { expenseSummary: summarizeExpenses(expenses), expenses } }
);
    setInput("");
    // Re-focus so mobile keyboards don't dismiss between sends.
    inputRef.current?.focus();
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-neutral-800 bg-[#121212]">
      {/* Message list */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-neutral-500 py-8 text-center">
            Ask about your spending — try "What did I spend most on this month?"
          </p>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Thinking indicator: rendered as its own bubble in the same
            position an assistant message would appear, so the handoff
            to the first token is a swap in place, not a layout jump. */}
        {showThinkingIndicator && (
          <div className="flex items-center gap-1.5 rounded-2xl bg-neutral-900 px-4 py-3 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-500 animate-bounce [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-500 animate-bounce [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-500 animate-bounce" />
          </div>
        )}

        {/* FE-08: designed error state, replaces silent failure.
            Shown when status === 'error' — network failure, mid-stream
            drop, rate limit, or any other request failure. */}
        {status === "error" && (
          <div className="flex flex-col gap-2 rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-3 w-fit max-w-[80%]">
            <p className="text-sm text-red-300">
              {error?.message?.includes("429")
                ? "You're sending messages too fast — wait a moment and try again."
                : "That message didn't go through."}
            </p>
            <button
              type="button"
              onClick={handleRetry}
              disabled={retrying}
              className="self-start rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-[#F7F6F2] hover:bg-red-700 disabled:opacity-50"
            >
              {retrying ? "Retrying…" : "Retry last message"}
            </button>
          </div>
        )}
      </div>

      {/* Jump-to-latest affordance — only shows once the user has
          scrolled away from the bottom during/after a stream. */}
      {!isAtBottom && (
        <button
          onClick={scrollToBottom}
          className="mx-auto mb-2 rounded-full bg-[#1E3AF2] px-3 py-1 text-xs font-medium text-[#F7F6F2]"
        >
          Jump to latest ↓
        </button>
      )}

      {/* Input row — stop button replaces send while busy, per the
          mentor note: this is a state problem, not a UI problem. */}
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-neutral-800 p-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Ask about your spending..."
          rows={1}
          disabled={isBusy}
          className="flex-1 resize-none rounded-md border border-neutral-700 bg-transparent px-3 py-2 text-sm text-[#F7F6F2] placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#1E3AF2] disabled:opacity-50"
        />

        {isBusy ? (
          <button
            type="button"
            onClick={stop}
            className="rounded-md bg-neutral-800 px-4 py-2 text-sm font-medium text-[#F7F6F2]"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded-md bg-[#1E3AF2] px-4 py-2 text-sm font-medium text-[#F7F6F2] disabled:opacity-40"
          >
            Send
          </button>
        )}
      </form>
    </div>
  );
}