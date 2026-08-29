// components/EmptyState.tsx
const EXAMPLES = [
  'How much did I spend on food this month?',
  'What was my biggest expense category last week?',
  'Am I spending more than last month?',
];

export default function EmptyState({
  onExampleClick,
}: {
  onExampleClick: (question: string) => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-lg font-medium">Ask me about your spending</p>
      <p className="text-sm text-gray-500">Try one of these:</p>
      <div className="flex flex-col gap-2">
        {EXAMPLES.map((q) => (
          <button
            key={q}
            onClick={() => onExampleClick(q)}
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}