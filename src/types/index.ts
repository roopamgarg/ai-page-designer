/**
 * Shared application types
 */

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  generatedHtml: string | null;
}

// Re-export chat types
export * from './chat';

export interface GenerateRequest {
  prompt: string;
  /** If provided, this is an edit request */
  currentHtml?: string;
}

export interface GenerateResponse {
  html: string;
  success: boolean;
  error?: string;
}

