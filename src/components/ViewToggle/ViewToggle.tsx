/**
 * ViewToggle Component
 * Responsibility: Toggle between Preview and Edit modes
 */
'use client';

export type ViewMode = 'preview' | 'edit';

interface ViewToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ mode, onModeChange }: ViewToggleProps) {
  return (
    <div className="
      inline-flex
      items-center
      p-1
      bg-zinc-800/50
      border
      border-zinc-700
      rounded-lg
    ">
      <button
        onClick={() => onModeChange('preview')}
        className={`
          flex
          items-center
          gap-2
          px-3
          py-1.5
          text-sm
          font-medium
          rounded-md
          transition-all
          duration-200
          ${
            mode === 'preview'
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }
        `}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        Preview
      </button>
      <button
        onClick={() => onModeChange('edit')}
        className={`
          flex
          items-center
          gap-2
          px-3
          py-1.5
          text-sm
          font-medium
          rounded-md
          transition-all
          duration-200
          ${
            mode === 'edit'
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }
        `}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        Edit
      </button>
    </div>
  );
}

