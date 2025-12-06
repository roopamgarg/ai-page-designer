/**
 * ApiKeyModal Component
 * Modal for users to input their Gemini API key
 */
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { storeApiKey, getStoredApiKey, clearStoredApiKey } from '@/lib/utils/apiKey';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeySet: (apiKey: string) => void;
}

export function ApiKeyModal({ isOpen, onClose, onApiKeySet }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing API key when modal opens
  useEffect(() => {
    if (isOpen) {
      const stored = getStoredApiKey();
      if (stored) {
        setApiKey(stored);
      }
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    const trimmedKey = apiKey.trim();
    
    if (!trimmedKey) {
      setError('Please enter an API key');
      return;
    }

    setIsSubmitting(true);

    try {
      // Store the API key
      storeApiKey(trimmedKey);
      
      // Notify parent component
      onApiKeySet(trimmedKey);
      
      // Close modal
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = () => {
    if (confirm('Are you sure you want to remove your API key? You will need to enter it again to use the application.')) {
      // Clear from localStorage
      clearStoredApiKey();
      // Clear local state
      setApiKey('');
      setError(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass rounded-2xl p-6 sm:p-8 max-w-md w-full border border-zinc-700/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              API Key Required
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Enter your Gemini API key to use this application
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
            disabled={isSubmitting}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Info Box */}
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-zinc-300">
              <p className="font-medium text-amber-400 mb-1">Get your API key</p>
              <p className="text-zinc-400">
                Visit{' '}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 underline"
                >
                  Google AI Studio
                </a>
                {' '}to create a free API key. Your key is stored locally in your browser.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="api-key"
              className="block text-sm font-medium text-zinc-300 mb-2"
            >
              Gemini API Key
            </label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError(null);
              }}
              placeholder="Enter your API key"
              className="
                w-full
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
                transition-all
                duration-200
              "
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!apiKey.trim() || isSubmitting}
              className="
                flex-1
                py-3
                px-4
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
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition-all
                duration-200
                flex
                items-center
                justify-center
                gap-2
              "
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save API Key
                </>
              )}
            </button>
            
            {apiKey && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isSubmitting}
                className="
                  px-4
                  py-3
                  text-sm
                  text-zinc-400
                  border
                  border-zinc-700
                  rounded-xl
                  hover:text-zinc-200
                  hover:border-zinc-600
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  transition-all
                  duration-200
                "
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Security Note */}
        <p className="mt-4 text-xs text-zinc-500 text-center">
          Your API key is stored locally in your browser and never sent to our servers
        </p>
      </div>
    </div>
  );
}

