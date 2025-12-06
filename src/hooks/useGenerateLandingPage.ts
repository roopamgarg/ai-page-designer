/**
 * Custom hook for landing page generation
 * Responsibility: API call logic & state management
 */
'use client';

import { useState, useCallback } from 'react';
import { GenerationState, GenerateResponse } from '@/types';

interface UseGenerateLandingPageReturn extends GenerationState {
  generate: (prompt: string) => Promise<void>;
  reset: () => void;
}

const initialState: GenerationState = {
  isLoading: false,
  error: null,
  generatedHtml: null,
};

export function useGenerateLandingPage(): UseGenerateLandingPageReturn {
  const [state, setState] = useState<GenerationState>(initialState);

  const generate = useCallback(async (prompt: string): Promise<void> => {
    setState({
      isLoading: true,
      error: null,
      generatedHtml: null,
    });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data: GenerateResponse = await response.json();

      if (!data.success) {
        setState({
          isLoading: false,
          error: data.error || 'Failed to generate landing page',
          generatedHtml: null,
        });
        return;
      }

      setState({
        isLoading: false,
        error: null,
        generatedHtml: data.html,
      });

    } catch (error) {
      setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
        generatedHtml: null,
      });
    }
  }, []);

  const reset = useCallback((): void => {
    setState(initialState);
  }, []);

  return {
    ...state,
    generate,
    reset,
  };
}

