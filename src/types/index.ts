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

export type ChatMode = 'edit' | 'ask';

export interface GenerateRequest {
  prompt: string;
  /** If provided, this is an edit request */
  currentHtml?: string;
  /** Style preset for generation */
  stylePreset?: StylePresetId;
  /** If provided, edit only this section */
  sectionId?: string;
  /** Section name for context */
  sectionName?: string;
  /** Section HTML to edit */
  sectionHtml?: string;
  /** Context about surrounding sections */
  sectionContext?: string;
  /** Chat mode: edit or ask */
  mode?: ChatMode;
}

export interface GenerateResponse {
  html: string;
  success: boolean;
  error?: string;
  /** For ask mode, the answer text */
  answer?: string;
  /** Summary of changes made during edit */
  summary?: string;
}

