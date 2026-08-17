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
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, stop } = useChat({
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isBusy) return;

    sendMessage(
      { text: trimmed },
      { body: { expenseSummary: summarizeExpenses(expenses) } }
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
