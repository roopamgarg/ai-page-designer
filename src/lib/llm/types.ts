/**
 * LLM Provider Interface
 * All LLM providers must implement this interface
 */
export interface LLMProvider {
  /**
   * Generate a landing page HTML based on the user prompt
   * @param prompt - User's description of the desired landing page
   * @returns Promise resolving to the generated HTML string
   */
  generateLandingPage(prompt: string): Promise<string>;
}

/**
 * Supported LLM provider types
 */
export type LLMProviderType = 'gemini' | 'openai' | 'anthropic';

