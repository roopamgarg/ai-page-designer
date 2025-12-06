/**
 * LLM Provider Factory
 * Returns the configured LLM provider instance
 */
import { LLMProvider, LLMProviderType } from './types';
import { GeminiProvider } from './gemini';

/**
 * Get the configured LLM provider
 * Add new providers here as they are implemented
 */
export function getLLMProvider(): LLMProvider {
  const providerType = (process.env.LLM_PROVIDER || 'gemini') as LLMProviderType;

  switch (providerType) {
    case 'gemini':
      return new GeminiProvider();
    
    // Future providers can be added here:
    // case 'openai':
    //   return new OpenAIProvider();
    // case 'anthropic':
    //   return new AnthropicProvider();
    
    default:
      throw new Error(`Unknown LLM provider: ${providerType}. Supported: gemini`);
  }
}

// Re-export types for convenience
export type { LLMProvider, LLMProviderType } from './types';

