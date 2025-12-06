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
  EDIT_ELEMENT_SYSTEM_PROMPT,
  ASK_MODE_SYSTEM_PROMPT,
  buildUserPrompt,
  buildEditPrompt,
  buildSectionEditPrompt,
  buildElementEditPrompt,
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

  async editElement(
    elementHtml: string,
    tagName: string,
    editPrompt: string
  ): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: EDIT_ELEMENT_SYSTEM_PROMPT,
    });

    const userPrompt = buildElementEditPrompt(elementHtml, tagName, editPrompt);

    const result = await model.generateContent(userPrompt);
    const response = result.response;
    const text = response.text();

    // Clean up any markdown or extra formatting
    return this.cleanHtmlResponse(text);
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
    
    // Sanitize any external images that slipped through
    cleaned = this.sanitizeImages(cleaned);
    
    return cleaned.trim();
  }

  /**
   * Replace external image URLs with inline SVG placeholders
   * This is a safety net in case the AI ignores the prompt instructions
   */
  private sanitizeImages(html: string): string {
    // Match <img> tags with external URLs (http/https)
    const imgPattern = /<img\s+[^>]*src\s*=\s*["'](https?:\/\/[^"']+)["'][^>]*\/?>/gi;
    
    return html.replace(imgPattern, (match, url) => {
      // Extract alt text if present
      const altMatch = match.match(/alt\s*=\s*["']([^"']*)["']/i);
      const alt = altMatch ? altMatch[1] : 'Image placeholder';
      
      // Extract class if present
      const classMatch = match.match(/class\s*=\s*["']([^"']*)["']/i);
      const className = classMatch ? classMatch[1] : '';
      
      // Determine placeholder type based on URL or alt text
      const lowerAlt = alt.toLowerCase();
      const lowerUrl = url.toLowerCase();
      
      if (lowerAlt.includes('avatar') || lowerAlt.includes('user') || lowerAlt.includes('person') || 
          lowerUrl.includes('avatar') || lowerUrl.includes('user')) {
        // Avatar placeholder
        return `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="${className}" role="img" aria-label="${alt}">
          <circle cx="50" cy="50" r="50" fill="var(--color-primary, #6366f1)" opacity="0.2"/>
          <circle cx="50" cy="38" r="18" fill="var(--color-primary, #6366f1)" opacity="0.4"/>
          <ellipse cx="50" cy="75" rx="28" ry="20" fill="var(--color-primary, #6366f1)" opacity="0.4"/>
        </svg>`;
      } else if (lowerAlt.includes('logo') || lowerUrl.includes('logo')) {
        // Logo placeholder
        return `<svg viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="${className}" role="img" aria-label="${alt}">
          <rect width="120" height="40" rx="4" fill="currentColor" opacity="0.1"/>
          <rect x="10" y="12" width="16" height="16" rx="4" fill="currentColor" opacity="0.3"/>
          <rect x="34" y="15" width="60" height="10" rx="2" fill="currentColor" opacity="0.2"/>
        </svg>`;
      } else {
        // Generic image placeholder
        const gradId = `placeholder-grad-${Math.random().toString(36).substr(2, 9)}`;
        return `<svg viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" class="${className}" role="img" aria-label="${alt}">
          <defs>
            <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:var(--color-primary, #6366f1);stop-opacity:0.2"/>
              <stop offset="100%" style="stop-color:var(--color-secondary, #8b5cf6);stop-opacity:0.3"/>
            </linearGradient>
          </defs>
          <rect width="800" height="600" fill="url(#${gradId})"/>
          <rect x="350" y="250" width="100" height="100" rx="12" fill="currentColor" opacity="0.15"/>
          <circle cx="400" cy="300" r="30" fill="currentColor" opacity="0.2"/>
        </svg>`;
      }
    });
  }
}
