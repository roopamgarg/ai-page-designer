/**
 * Shared application types
 */

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  generatedHtml: string | null;
}

export interface GenerateRequest {
  prompt: string;
}

export interface GenerateResponse {
  html: string;
  success: boolean;
  error?: string;
}

