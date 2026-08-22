/**
 * components/chat/message-bubble.tsx
 *
 * FE-06's message bubble, extended for FE-07: text parts still render
 * through react-markdown; any part whose type starts with "tool-"
 * (e.g. "tool-getCategoryBreakdown") gets handed to ToolCallCard,
 * which renders the lifecycle state as a real component instead of
 * a JSON dump.
 */

import ReactMarkdown from "react-markdown";
import type { UIMessage } from "ai";
import { ToolCallCard } from "./tool-call-card";

type MessagePart = UIMessage["parts"][number];

export function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed space-y-2 ${
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

          if (part.type.startsWith("tool-")) {
            return <ToolCallCard key={i} part={part} />;
          }

          return null;
        })}
      </div>
    </div>
  );
}
