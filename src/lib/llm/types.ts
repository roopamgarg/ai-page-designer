import { StylePresetId } from '@/types/stylePresets';

/**
 * LLM Provider Interface
 * All LLM providers must implement this interface
 */
export interface LLMProvider {
  /**
   * Generate a landing page HTML based on the user prompt
   * @param prompt - User's description of the desired landing page
   * @param stylePreset - Optional style preset to apply
   * @returns Promise resolving to the generated HTML string
   */
  generateLandingPage(prompt: string, stylePreset?: StylePresetId): Promise<string>;

  /**
   * Edit an existing landing page based on a follow-up prompt
   * @param currentHtml - The current HTML to modify
   * @param editPrompt - User's description of the changes to make
   * @returns Promise resolving to the updated HTML string
   */
  editLandingPage(currentHtml: string, editPrompt: string): Promise<string>;
}

/**
 * Supported LLM provider types
 */
export type LLMProviderType = 'gemini' | 'openai' | 'anthropic';

