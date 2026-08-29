// app/chat/error.tsx
'use client';

import { useEffect } from 'react';

export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to your console/monitoring — not shown to the user
    console.error('Chat route crashed:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-lg font-medium">Something went wrong loading your chat.</p>
      <p className="text-sm text-gray-500">
        This is on our end, not yours — try again.
      </p>
      <button
        onClick={() => reset()}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  );
}