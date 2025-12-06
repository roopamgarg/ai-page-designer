/**
 * PromptForm Component
 * Responsibility: Render form UI and emit submit events
 */
'use client';

import { useState, FormEvent } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface PromptFormProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export function PromptForm({ onSubmit, isLoading }: PromptFormProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
    }
  };

  const examplePrompts = [
    'A SaaS product for project management with dark theme',
    'A fitness app landing page with energetic colors',
    'A minimalist portfolio for a photographer',
    'An eco-friendly product store with nature vibes',
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="space-y-2">
        <label 
          htmlFor="prompt" 
          className="block text-sm font-medium text-zinc-300"
        >
          Describe your landing page
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g., A modern landing page for an AI-powered writing assistant with a clean, professional design, hero section with demo, features grid, testimonials, and pricing..."
          className="
            w-full
            h-40
            px-4
            py-3
            bg-zinc-900/50
            border
            border-zinc-700
            rounded-xl
            text-zinc-100
            placeholder:text-zinc-500
            focus:outline-none
            focus:ring-2
            focus:ring-amber-500/50
            focus:border-amber-500
            resize-none
            transition-all
            duration-200
          "
          disabled={isLoading}
        />
      </div>

      <div className="space-y-3">
        <p className="text-xs text-zinc-500">Try an example:</p>
        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPrompt(example)}
              disabled={isLoading}
              className="
                px-3
                py-1.5
                text-xs
                bg-zinc-800/50
                border
                border-zinc-700
                rounded-full
                text-zinc-400
                hover:text-zinc-200
                hover:border-zinc-500
                transition-all
                duration-200
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!prompt.trim() || isLoading}
        className="
          w-full
          py-4
          px-6
          bg-gradient-to-r
          from-amber-500
          to-orange-500
          text-zinc-900
          font-semibold
          rounded-xl
          hover:from-amber-400
          hover:to-orange-400
          focus:outline-none
          focus:ring-2
          focus:ring-amber-500/50
          focus:ring-offset-2
          focus:ring-offset-zinc-900
          disabled:opacity-50
          disabled:cursor-not-allowed
          disabled:hover:from-amber-500
          disabled:hover:to-orange-500
          transition-all
          duration-200
          flex
          items-center
          justify-center
          gap-3
        "
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            <span>Generating your landing page...</span>
          </>
        ) : (
          <>
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>Generate Landing Page</span>
          </>
        )}
      </button>
    </form>
  );
}

