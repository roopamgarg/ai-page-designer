/**
 * LLM Provider Factory
 * Returns the configured LLM provider instance
 */
import { LLMProvider, LLMProviderType } from './types';
import { GeminiProvider } from './gemini';

/**
 * Get the configured LLM provider
 * Add new providers here as they are implemented
 * @param apiKey Optional API key to use (overrides environment variable)
 */
export function getLLMProvider(apiKey?: string): LLMProvider {
  const providerType = (process.env.LLM_PROVIDER || 'gemini') as LLMProviderType;

  switch (providerType) {
    case 'gemini':
      return new GeminiProvider(apiKey);
    
    // Future providers can be added here:
    // case 'openai':
    //   return new OpenAIProvider(apiKey);
    // case 'anthropic':
    //   return new AnthropicProvider(apiKey);
    
    default:
      throw new Error(`Unknown LLM provider: ${providerType}. Supported: gemini`);
  }
}

// Re-export types for convenience
export type { LLMProvider, LLMProviderType } from './types';

