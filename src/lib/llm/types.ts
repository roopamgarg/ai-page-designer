import { StylePresetId } from '@/types/stylePresets';

/**
 * Result of an edit operation
 */
export interface EditResult {
  html: string;
  summary: string;
}

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
   * @returns Promise resolving to the updated HTML and summary
   */
  editLandingPage(currentHtml: string, editPrompt: string): Promise<EditResult>;

  /**
   * Edit a specific section of a landing page
   * @param sectionHtml - The section HTML to modify
   * @param sectionName - Name of the section being edited
   * @param editPrompt - User's description of the changes to make
   * @param context - Optional context about surrounding sections
   * @returns Promise resolving to the updated section HTML and summary
   */
  editSection(
    sectionHtml: string, 
    sectionName: string, 
    editPrompt: string, 
    context?: string
  ): Promise<EditResult>;

  /**
   * Edit a single HTML element
   * @param elementHtml - The element HTML to modify
   * @param tagName - The tag name of the element (h1, p, button, etc.)
   * @param editPrompt - User's description of the changes to make
   * @returns Promise resolving to the updated element HTML
   */
  editElement(
    elementHtml: string,
    tagName: string,
    editPrompt: string
  ): Promise<string>;

  /**
   * Answer a question about a landing page without modifying it
   * @param currentHtml - The current HTML to analyze
   * @param question - User's question about the landing page
   * @returns Promise resolving to the answer text
   */
  askQuestion(currentHtml: string, question: string): Promise<string>;
}

/**
 * Supported LLM provider types
 */
export type LLMProviderType = 'gemini' | 'openai' | 'anthropic';
