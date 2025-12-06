/**
 * PromptForm Component
 * Responsibility: Render form UI and emit submit events
 */
'use client';

import { useState, FormEvent } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { StylePresetId } from '@/types/stylePresets';
import { getAllStylePresets } from '@/lib/llm/stylePresets';

interface PromptFormProps {
  onSubmit: (prompt: string, stylePreset: StylePresetId) => void;
  isLoading: boolean;
}

const stylePresets = getAllStylePresets();

export function PromptForm({ onSubmit, isLoading }: PromptFormProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<StylePresetId>('startup');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim(), selectedPreset);
    }
  };

  const examplePrompts = [
    'A SaaS product for project management',
    'A fitness app with workout tracking',
    'A portfolio for a creative agency',
    'An eco-friendly product marketplace',
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Prompt Input */}
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
          placeholder="E.g., A modern landing page for an AI-powered writing assistant with hero section, features grid, testimonials, and pricing..."
          className="
            w-full
            h-32
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

      {/* Example Prompts */}
      <div className="space-y-2">
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

      {/* Style Preset Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-zinc-300">
          Choose a style
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {stylePresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setSelectedPreset(preset.id)}
              disabled={isLoading}
              className={`
                relative
                p-3
                rounded-xl
                border
                text-left
                transition-all
                duration-200
                disabled:opacity-50
                disabled:cursor-not-allowed
                ${selectedPreset === preset.id
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-zinc-700 bg-zinc-800/30 hover:border-zinc-600 hover:bg-zinc-800/50'
                }
              `}
            >
              {/* Color Preview */}
              <div className="flex gap-1 mb-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: preset.colors.primary }}
                />
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: preset.colors.secondary }}
                />
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: preset.colors.accent }}
                />
              </div>
              
              {/* Preset Name */}
              <p className={`text-sm font-medium ${
                selectedPreset === preset.id ? 'text-amber-400' : 'text-zinc-200'
              }`}>
                {preset.name}
              </p>
              
              {/* Description */}
              <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                {preset.description}
              </p>

              {/* Selected Indicator */}
              {selectedPreset === preset.id && (
                <div className="absolute top-2 right-2">
                  <svg 
                    className="w-4 h-4 text-amber-400" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
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
