/**
 * components/chat/message-bubble.tsx
 *
 * Renders one message's typed parts. Uses react-markdown instead of
 * dangerouslySetInnerHTML on the raw string — react-markdown re-parses
 * the full text on every render, so a half-open code fence or a
 * dangling ** just renders as plain text until it closes, instead of
 * breaking the layout. That's the "buffer or use a streaming-aware
 * renderer" mentor tip, satisfied by the library choice.
 */

import ReactMarkdown from "react-markdown";
import type { UIMessage } from "ai";

export function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-[#1E3AF2] text-[#F7F6F2]"
            : "bg-neutral-900 text-[#F7F6F2] border border-neutral-800"
        }`}
      >
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            return (
              <div key={i} className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{part.text}</ReactMarkdown>
              </div>
            );
          }
          // Other part types (reasoning, tool calls, etc.) are ignored
          // here since this feature doesn't use tools — extend this
          // switch if FE-07 adds them.
          return null;
        })}
      </div>
    </div>
  );
}
