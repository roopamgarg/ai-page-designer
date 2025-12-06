/**
 * Custom hook for landing page generation
 * Responsibility: API call logic & state management
 */
'use client';

import { useState, useCallback } from 'react';
import { GenerationState, GenerateResponse, ChatMessage, StylePresetId } from '@/types';

interface UseGenerateLandingPageReturn extends GenerationState {
  messages: ChatMessage[];
  generate: (prompt: string, stylePreset?: StylePresetId) => Promise<void>;
  edit: (currentHtml: string, editPrompt: string) => Promise<void>;
  reset: () => void;
}

const initialState: GenerationState = {
  isLoading: false,
  error: null,
  generatedHtml: null,
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function useGenerateLandingPage(): UseGenerateLandingPageReturn {
  const [state, setState] = useState<GenerationState>(initialState);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const addUserMessage = (content: string): void => {
    const message: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const addAssistantMessage = (content: string, html?: string): void => {
    const message: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      html,
    };
    setMessages((prev) => [...prev, message]);
  };

  const generate = useCallback(async (prompt: string, stylePreset?: StylePresetId): Promise<void> => {
    // Add user message
    addUserMessage(prompt);

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
        body: JSON.stringify({ prompt, stylePreset }),
      });

      const data: GenerateResponse = await response.json();

      if (!data.success) {
        addAssistantMessage(`Sorry, I couldn't generate the page: ${data.error}`);
        setState({
          isLoading: false,
          error: data.error || 'Failed to generate landing page',
          generatedHtml: null,
        });
        return;
      }

      addAssistantMessage(
        "I've created your landing page! You can preview it, edit the code, or ask me to make changes.",
        data.html
      );

      setState({
        isLoading: false,
        error: null,
        generatedHtml: data.html,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      addAssistantMessage(`Sorry, an error occurred: ${errorMessage}`);
      setState({
        isLoading: false,
        error: errorMessage,
        generatedHtml: null,
      });
    }
  }, []);

  const edit = useCallback(async (currentHtml: string, editPrompt: string): Promise<void> => {
    // Add user message
    addUserMessage(editPrompt);

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: editPrompt,
          currentHtml,
        }),
      });

      const data: GenerateResponse = await response.json();

      if (!data.success) {
        addAssistantMessage(`Sorry, I couldn't make those changes: ${data.error}`);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: data.error || 'Failed to edit landing page',
        }));
        return;
      }

      addAssistantMessage(
        "Done! I've updated the landing page with your changes.",
        data.html
      );

      setState({
        isLoading: false,
        error: null,
        generatedHtml: data.html,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      addAssistantMessage(`Sorry, an error occurred: ${errorMessage}`);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, []);

  const reset = useCallback((): void => {
    setState(initialState);
    setMessages([]);
  }, []);

  return {
    ...state,
    messages,
    generate,
    edit,
    reset,
  };
}
