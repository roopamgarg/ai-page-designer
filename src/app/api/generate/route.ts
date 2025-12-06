/**
 * API Route: /api/generate
 * Handles landing page generation requests
 * Responsibility: HTTP handling only - delegates to LLM provider
 */
import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/llm';
import { GenerateRequest, GenerateResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse>> {
  try {
    const body: GenerateRequest = await request.json();
    
    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Prompt is required and must be a string',
          html: '' 
        },
        { status: 400 }
      );
    }

    // Get API key from request body or use environment variable
    const apiKey = body.apiKey || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'GEMINI_API_KEY is required. Please provide an API key.',
          html: '' 
        },
        { status: 400 }
      );
    }

    const provider = getLLMProvider(apiKey);

    // Handle ask mode
    if (body.mode === 'ask' && body.currentHtml) {
      const answer = await provider.askQuestion(body.currentHtml, body.prompt);
      return NextResponse.json({
        success: true,
        html: '',
        answer,
      });
    }

    // Determine request type for edit/generate modes
    const isElementEdit = !!body.sectionHtml && body.sectionId === 'element';
    const isSectionEdit = !!body.sectionHtml && !!body.sectionId && !isElementEdit;
    const isFullPageEdit = !!body.currentHtml && !isSectionEdit && !isElementEdit;
    const isNewGeneration = !isFullPageEdit && !isSectionEdit && !isElementEdit;

    // For new generation, require at least 10 characters
    // For edits, allow shorter prompts like "make it blue"
    const minLength = isNewGeneration ? 10 : 3;

    if (body.prompt.trim().length < minLength) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Please provide a more detailed description (at least ${minLength} characters)`,
          html: '' 
        },
        { status: 400 }
      );
    }

    let html: string;
    let summary: string | undefined;
    
    if (isElementEdit) {
      // Edit single element - returns just html string
      const tagName = body.sectionName?.replace(' element', '') || 'element';
      html = await provider.editElement(
        body.sectionHtml!,
        tagName,
        body.prompt
      );
      summary = 'Element updated';
    } else if (isSectionEdit) {
      // Edit specific section - returns { html, summary }
      const result = await provider.editSection(
        body.sectionHtml!,
        body.sectionName || 'Section',
        body.prompt,
        body.sectionContext
      );
      html = result.html;
      summary = result.summary;
    } else if (isFullPageEdit) {
      // Edit entire page - returns { html, summary }
      const result = await provider.editLandingPage(body.currentHtml!, body.prompt);
      html = result.html;
      summary = result.summary;
    } else {
      // Generate new page - returns just html string
      html = await provider.generateLandingPage(body.prompt, body.stylePreset);
    }

    return NextResponse.json({
      success: true,
      html,
      summary,
    });

  } catch (error) {
    console.error('Generation error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred';

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        html: '' 
      },
      { status: 500 }
    );
  }
}
