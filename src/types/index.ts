/**
 * Shared application types
 */

import { StylePresetId } from './stylePresets';

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  generatedHtml: string | null;
}

// Re-export chat types
export * from './chat';

// Re-export style preset types
export * from './stylePresets';

export interface GenerateRequest {
  prompt: string;
  /** If provided, this is an edit request */
  currentHtml?: string;
  /** Style preset for generation */
  stylePreset?: StylePresetId;
}

export interface GenerateResponse {
  html: string;
  success: boolean;
  error?: string;
}

