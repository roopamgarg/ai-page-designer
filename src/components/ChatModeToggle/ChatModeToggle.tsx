/**
 * ChatModeToggle Component
 * Toggle between Edit and Ask modes in chat
 */
'use client';

import { ChatMode } from '@/types';

interface ChatModeToggleProps {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  disabled?: boolean;
}

export function ChatModeToggle({ mode, onModeChange, disabled = false }: ChatModeToggleProps) {
  return (
    <div className="
      inline-flex
      items-center
      p-0.5
      bg-zinc-800/50
      border
      border-zinc-700
      rounded-lg
    ">
      <button
        onClick={() => onModeChange('edit')}
        disabled={disabled}
        className={`
          flex
          items-center
          gap-1.5
          px-2.5
          py-1
          text-xs
          font-medium
          rounded-md
          transition-all
          duration-200
          disabled:opacity-50
          ${
            mode === 'edit'
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }
        `}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        Edit
      </button>
      <button
        onClick={() => onModeChange('ask')}
        disabled={disabled}
        className={`
          flex
          items-center
          gap-1.5
          px-2.5
          py-1
          text-xs
          font-medium
          rounded-md
          transition-all
          duration-200
          disabled:opacity-50
          ${
            mode === 'ask'
              ? 'bg-blue-500/20 text-blue-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }
        `}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Ask
      </button>
    </div>
  );
}

