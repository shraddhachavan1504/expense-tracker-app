// components/ChatInterface.tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function ChatInterface() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    error,
    reload,
    status, // 'submitted' | 'streaming' | 'ready' | 'error' in recent SDK versions
  } = useChat({
    api: '/api/chat',
  });

  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (retrying) return; // guard against double-click
    setRetrying(true);
    try {
      await reload();
    } finally {
      setRetrying(false);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full flex-col">
      {isEmpty ? (
        <EmptyState onExampleClick={(q) => handleInputChange({ target: { value: q } } as any)} />
      ) : (
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}

          {status === 'submitted' && <ThinkingIndicator />}

          {error && (
            <div className="flex flex-col gap-2 rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">
                {error.message.includes('429')
                  ? "You're sending messages too fast — wait a moment and try again."
                  : "That message didn't go through."}
              </p>
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="self-start rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                {retrying ? 'Retrying…' : 'Retry last message'}
              </button>
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="border-t p-3"
      >
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about your spending…"
          className="w-full rounded-md border px-3 py-2"
        />
      </form>
    </div>
  );
}