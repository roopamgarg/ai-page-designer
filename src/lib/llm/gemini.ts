/**
 * Gemini LLM Provider Implementation
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, EditResult } from './types';
import { StylePresetId } from '@/types/stylePresets';
import { 
  LANDING_PAGE_SYSTEM_PROMPT, 
  EDIT_LANDING_PAGE_SYSTEM_PROMPT,
  EDIT_SECTION_SYSTEM_PROMPT,
  ASK_MODE_SYSTEM_PROMPT,
  buildUserPrompt,
  buildEditPrompt,
  buildSectionEditPrompt,
  buildAskPrompt,
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

  async generateLandingPage(prompt: string, stylePreset?: StylePresetId): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: LANDING_PAGE_SYSTEM_PROMPT,
    });

    const userPrompt = buildUserPrompt(prompt, stylePreset);

    const result = await model.generateContent(userPrompt);
    const response = result.response;
    const text = response.text();

    // Clean up the response - remove any markdown code blocks if present
    return this.cleanHtmlResponse(text);
  }

  async editLandingPage(currentHtml: string, editPrompt: string): Promise<EditResult> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: EDIT_LANDING_PAGE_SYSTEM_PROMPT,
    });

    const userPrompt = buildEditPrompt(currentHtml, editPrompt);

    const result = await model.generateContent(userPrompt);
    const response = result.response;
    const text = response.text();

    return this.parseEditResponse(text);
  }

  async editSection(
    sectionHtml: string, 
    sectionName: string, 
    editPrompt: string, 
    context?: string
  ): Promise<EditResult> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: EDIT_SECTION_SYSTEM_PROMPT,
    });

    const userPrompt = buildSectionEditPrompt(sectionHtml, sectionName, editPrompt, context);

    const result = await model.generateContent(userPrompt);
    const response = result.response;
    const text = response.text();

    return this.parseEditResponse(text);
  }

  async askQuestion(currentHtml: string, question: string): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: ASK_MODE_SYSTEM_PROMPT,
    });

    const userPrompt = buildAskPrompt(currentHtml, question);

    const result = await model.generateContent(userPrompt);
    const response = result.response;
    return response.text();
  }

  /**
   * Parse edit response to extract HTML and summary
   */
  private parseEditResponse(text: string): EditResult {
    let html = '';
    let summary = '';

    // Try to extract HTML using markers
    const htmlStartMarker = '[HTML_START]';
    const htmlEndMarker = '[HTML_END]';
    const summaryStartMarker = '[SUMMARY_START]';
    const summaryEndMarker = '[SUMMARY_END]';

    const htmlStartIndex = text.indexOf(htmlStartMarker);
    const htmlEndIndex = text.indexOf(htmlEndMarker);
    const summaryStartIndex = text.indexOf(summaryStartMarker);
    const summaryEndIndex = text.indexOf(summaryEndMarker);

    // Extract summary first (if present)
    if (summaryStartIndex !== -1 && summaryEndIndex !== -1) {
      summary = text.substring(summaryStartIndex + summaryStartMarker.length, summaryEndIndex).trim();
    }

    // Extract HTML between markers
    if (htmlStartIndex !== -1 && htmlEndIndex !== -1) {
      html = text.substring(htmlStartIndex + htmlStartMarker.length, htmlEndIndex).trim();
    } else {
      // Fallback: if HTML markers weren't found, use the entire text
      // but remove any summary section first
      let fallbackText = text;
      if (summaryStartIndex !== -1 && summaryEndIndex !== -1) {
        // Remove the summary section from the text
        fallbackText = text.substring(0, summaryStartIndex) + 
                       text.substring(summaryEndIndex + summaryEndMarker.length);
      }
      html = fallbackText;
      if (!summary) {
        summary = 'Changes applied successfully.';
      }
    }

    // Clean up the HTML - remove any remaining markers and markdown
    html = this.cleanHtmlResponse(html);

    return { html, summary };
  }

  /**
   * Clean HTML response - remove markers, markdown, and ensure pure HTML
   */
  private cleanHtmlResponse(text: string): string {
    let cleaned = text.trim();
    
    // Remove any stray markers that might have been included
    cleaned = cleaned.replace(/\[HTML_START\]/g, '');
    cleaned = cleaned.replace(/\[HTML_END\]/g, '');
    cleaned = cleaned.replace(/\[SUMMARY_START\][\s\S]*?\[SUMMARY_END\]/g, '');
    cleaned = cleaned.replace(/\[SUMMARY_START\]/g, '');
    cleaned = cleaned.replace(/\[SUMMARY_END\]/g, '');
    
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
