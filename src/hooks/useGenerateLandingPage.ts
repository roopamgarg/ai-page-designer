/**
 * Custom hook for landing page generation
 * Responsibility: API call logic & state management
 */
'use client';

import { useState, useCallback } from 'react';
import { GenerationState, GenerateResponse, ChatMessage, StylePresetId } from '@/types';
import { extractSection, replaceSection, getSectionContext } from '@/lib/utils/sectionParser';
import { getStoredApiKey } from '@/lib/utils/apiKey';

interface EditSectionParams {
  fullHtml: string;
  sectionId: string;
  sectionName: string;
  editPrompt: string;
}

interface UseGenerateLandingPageReturn extends GenerationState {
  messages: ChatMessage[];
  generate: (prompt: string, stylePreset?: StylePresetId) => Promise<void>;
  edit: (currentHtml: string, editPrompt: string) => Promise<void>;
  editSection: (params: EditSectionParams) => Promise<void>;
  ask: (currentHtml: string, question: string) => Promise<void>;
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
      const apiKey = getStoredApiKey();
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, stylePreset, ...(apiKey && { apiKey }) }),
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
      const apiKey = getStoredApiKey();
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: editPrompt,
          currentHtml,
          ...(apiKey && { apiKey }),
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

      // Build response message with summary
      const summaryText = data.summary 
        ? `**Changes Made:**\n${data.summary}` 
        : "I've updated the landing page with your changes.";

      addAssistantMessage(summaryText, data.html);

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

  const editSection = useCallback(async ({
    fullHtml,
    sectionId,
    sectionName,
    editPrompt,
  }: EditSectionParams): Promise<void> => {
    // Add user message with section context
    addUserMessage(`[${sectionName}] ${editPrompt}`);

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      // Extract the section to edit
      const section = extractSection(fullHtml, sectionId);
      
      if (!section) {
        addAssistantMessage(`Sorry, I couldn't find the "${sectionName}" section to edit.`);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: `Section "${sectionName}" not found`,
        }));
        return;
      }

      // Get context about surrounding sections
      const context = getSectionContext(fullHtml, sectionId);

      const apiKey = getStoredApiKey();
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: editPrompt,
          sectionId,
          sectionName,
          sectionHtml: section.html,
          sectionContext: context,
          ...(apiKey && { apiKey }),
        }),
      });

      const data: GenerateResponse = await response.json();

      if (!data.success) {
        addAssistantMessage(`Sorry, I couldn't update the ${sectionName}: ${data.error}`);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: data.error || `Failed to edit ${sectionName}`,
        }));
        return;
      }

      // Replace the section in the full HTML
      const updatedFullHtml = replaceSection(fullHtml, sectionId, data.html);

      // Build response message with summary
      const summaryText = data.summary 
        ? `**${sectionName} Updated:**\n${data.summary}` 
        : `I've updated the ${sectionName} section.`;

      addAssistantMessage(summaryText, updatedFullHtml);

      setState({
        isLoading: false,
        error: null,
        generatedHtml: updatedFullHtml,
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

  const ask = useCallback(async (currentHtml: string, question: string): Promise<void> => {
    // Add user message with question indicator
    addUserMessage(`❓ ${question}`);

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const apiKey = getStoredApiKey();
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: question,
          currentHtml,
          mode: 'ask',
          ...(apiKey && { apiKey }),
        }),
      });

      const data: GenerateResponse = await response.json();

      if (!data.success) {
        addAssistantMessage(`Sorry, I couldn't answer that: ${data.error}`);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: data.error || 'Failed to get answer',
        }));
        return;
      }

      // Add answer as assistant message (no HTML update)
      addAssistantMessage(data.answer || 'No answer available.');

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: null,
      }));

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
    editSection,
    ask,
    reset,
  };
}
