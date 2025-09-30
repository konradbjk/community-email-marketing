interface PromptSuggestionsProps {
  label: string;
  append: (message: { role: 'user'; content: string }) => void;
  suggestions: string[];
}

export function PromptSuggestions({
  label,
  append,
  suggestions,
}: PromptSuggestionsProps) {
  return (
    <div className='flex items-center justify-center min-h-[50vh] px-6 py-8'>
      <div className='max-w-6xl w-full space-y-8'>
        <h2 className='text-center text-2xl font-bold'>{label}</h2>
        <div className='grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 text-xs'>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => append({ role: 'user', content: suggestion })}
              className='text-left rounded-xl border bg-background p-6 hover:bg-muted transition-colors h-auto min-h-[120px] flex items-center'
            >
              <p className='leading-relaxed'>{suggestion}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
