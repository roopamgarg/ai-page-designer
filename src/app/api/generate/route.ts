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

    // For new generation, require at least 10 characters
    // For edits, allow shorter prompts like "make it blue"
    const isEditRequest = !!body.currentHtml;
    const minLength = isEditRequest ? 3 : 10;

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

    const provider = getLLMProvider();
    
    // Determine if this is an edit or new generation
    const html = isEditRequest
      ? await provider.editLandingPage(body.currentHtml!, body.prompt)
      : await provider.generateLandingPage(body.prompt);

    return NextResponse.json({
      success: true,
      html,
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

