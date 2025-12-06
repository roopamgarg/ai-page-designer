/**
 * Gemini LLM Provider Implementation
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider } from './types';
import { 
  LANDING_PAGE_SYSTEM_PROMPT, 
  EDIT_LANDING_PAGE_SYSTEM_PROMPT,
  buildUserPrompt,
  buildEditPrompt,
} from './prompts';

export class GeminiProvider implements LLMProvider {
  private client: GoogleGenerativeAI;
  private modelName: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  }

  async generateLandingPage(prompt: string): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: LANDING_PAGE_SYSTEM_PROMPT,
    });

    const userPrompt = buildUserPrompt(prompt);

    const result = await model.generateContent(userPrompt);
    const response = result.response;
    const text = response.text();

    // Clean up the response - remove any markdown code blocks if present
    return this.cleanHtmlResponse(text);
  }

  async editLandingPage(currentHtml: string, editPrompt: string): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: EDIT_LANDING_PAGE_SYSTEM_PROMPT,
    });

    const userPrompt = buildEditPrompt(currentHtml, editPrompt);

    const result = await model.generateContent(userPrompt);
    const response = result.response;
    const text = response.text();

    return this.cleanHtmlResponse(text);
  }

  private cleanHtmlResponse(text: string): string {
    let cleaned = text.trim();
    
    // Remove markdown code block markers if present
    if (cleaned.startsWith('```html')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    
    return cleaned.trim();
  }
}

