/**
 * FollowUpPrompt Component
 * Responsibility: Input for editing generated page with follow-up prompts
 */
'use client';

import { useState, FormEvent, KeyboardEvent } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface FollowUpPromptProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  /** Compact mode for chat panel */
  compact?: boolean;
}

export function FollowUpPrompt({ onSubmit, isLoading, compact = true }: FollowUpPromptProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
      setPrompt('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() && !isLoading) {
        onSubmit(prompt.trim());
        setPrompt('');
      }
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for changes..."
            rows={1}
            disabled={isLoading}
            className="
              w-full
              px-3
              py-2
              bg-zinc-900/50
              border
              border-zinc-700
              rounded-lg
              text-zinc-100
              text-sm
              placeholder:text-zinc-500
              focus:outline-none
              focus:ring-2
              focus:ring-amber-500/50
              focus:border-amber-500
              resize-none
              transition-all
              duration-200
              disabled:opacity-50
            "
            style={{ minHeight: '38px', maxHeight: '100px' }}
          />
        </div>
        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="
            flex-shrink-0
            w-9
            h-9
            flex
            items-center
            justify-center
            bg-amber-500
            text-zinc-900
            rounded-lg
            hover:bg-amber-400
            focus:outline-none
            focus:ring-2
            focus:ring-amber-500/50
            disabled:opacity-50
            disabled:cursor-not-allowed
            disabled:hover:bg-amber-500
            transition-all
            duration-200
          "
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </form>
    );
  }

  const suggestions = [
    'Change the color scheme to blue',
    'Add a testimonials section',
    'Make the hero section larger',
    'Add more call-to-action buttons',
  ];

  return (
    <div className="glass rounded-xl p-4 border border-zinc-700/50">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you'd like to change... (Press Enter to submit)"
              rows={2}
              disabled={isLoading}
              className="
                w-full
                px-3
                py-2
                bg-zinc-900/50
                border
                border-zinc-700
                rounded-lg
                text-zinc-100
                text-sm
                placeholder:text-zinc-500
                focus:outline-none
                focus:ring-2
                focus:ring-amber-500/50
                focus:border-amber-500
                resize-none
                transition-all
                duration-200
                disabled:opacity-50
              "
            />
          </div>
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="
              flex-shrink-0
              w-10
              h-10
              flex
              items-center
              justify-center
              bg-amber-500
              text-zinc-900
              rounded-lg
              hover:bg-amber-400
              focus:outline-none
              focus:ring-2
              focus:ring-amber-500/50
              disabled:opacity-50
              disabled:cursor-not-allowed
              disabled:hover:bg-amber-500
              transition-all
              duration-200
            "
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-1.5 pl-11">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPrompt(suggestion)}
              disabled={isLoading}
              className="
                px-2
                py-1
                text-xs
                bg-zinc-800/50
                border
                border-zinc-700/50
                rounded-md
                text-zinc-500
                hover:text-zinc-300
                hover:border-zinc-600
                transition-all
                duration-200
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {suggestion}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
