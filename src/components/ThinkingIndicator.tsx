// components/ThinkingIndicator.tsx
export default function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-3 w-fit max-w-[70%]">
      <span className="h-2 w-2 animate-pulse rounded-full bg-gray-400" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-gray-400 [animation-delay:150ms]" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-gray-400 [animation-delay:300ms]" />
    </div>
  );
}