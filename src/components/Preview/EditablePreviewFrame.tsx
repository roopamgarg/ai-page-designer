/**
 * EditablePreviewFrame Component
 * Responsibility: Render iframe with direct element editing capabilities
 */
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { injectEditorScript, cleanEditorArtifacts } from '@/lib/utils/elementEditorScript';

interface AiEditRequest {
  elementHtml: string;
  tagName: string;
  prompt: string;
}

interface EditablePreviewFrameProps {
  html: string;
  deviceWidth: string;
  onHtmlChange: (html: string) => void;
  onAiEditRequest?: (request: AiEditRequest) => Promise<{ success: boolean; html?: string; error?: string }>;
}

interface EditorMessage {
  source: 'element-editor';
  type: 'editor-ready' | 'element-selected' | 'element-deselected' | 'html-changed' | 'ai-edit-request';
  payload: {
    html?: string;
    path?: string;
    tagName?: string;
    elementHtml?: string;
    prompt?: string;
  };
}

export function EditablePreviewFrame({ 
  html, 
  deviceWidth, 
  onHtmlChange,
  onAiEditRequest 
}: EditablePreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastInternalHtmlRef = useRef<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Track the HTML to render - only update when external changes come in
  const [renderedHtml, setRenderedHtml] = useState(html);
  
  // Update rendered HTML only when external html prop changes (not from internal edits)
  useEffect(() => {
    // If the incoming html matches what we last sent internally, skip the update
    // This prevents scroll reset when changes come from within the iframe
    if (html !== lastInternalHtmlRef.current) {
      setRenderedHtml(html);
    }
  }, [html]);

  // Inject editor script into HTML
  const editableHtml = injectEditorScript(renderedHtml);

  // Send message to iframe
  const sendToIframe = useCallback((type: string, payload: Record<string, unknown>) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { source: 'element-editor-parent', type, payload },
        '*'
      );
    }
  }, []);

  // Handle AI edit request
  const handleAiEditRequest = useCallback(async (elementHtml: string, tagName: string, prompt: string) => {
    if (!onAiEditRequest || isAiLoading) return;
    
    setIsAiLoading(true);
    try {
      const result = await onAiEditRequest({ elementHtml, tagName, prompt });
      sendToIframe('ai-edit-result', result);
    } catch (error) {
      sendToIframe('ai-edit-result', { 
        success: false, 
        error: error instanceof Error ? error.message : 'AI edit failed' 
      });
    } finally {
      setIsAiLoading(false);
    }
  }, [onAiEditRequest, isAiLoading, sendToIframe]);

  // Handle messages from iframe
  const handleMessage = useCallback((event: MessageEvent<EditorMessage>) => {
    // Verify message is from our editor
    if (event.data?.source !== 'element-editor') return;

    const { type, payload } = event.data;

    switch (type) {
      case 'editor-ready':
        // Editor initialized in iframe
        break;

      case 'element-selected':
        // Could show element info in parent UI if needed
        break;

      case 'element-deselected':
        // Could update parent UI state if needed
        break;

      case 'html-changed':
        if (payload.html) {
          // Clean up editor artifacts and notify parent
          const cleanHtml = cleanEditorArtifacts(payload.html);
          // Track this as an internal change to prevent iframe re-render
          lastInternalHtmlRef.current = cleanHtml;
          onHtmlChange(cleanHtml);
        }
        break;

      case 'ai-edit-request':
        if (payload.elementHtml && payload.prompt && payload.tagName) {
          handleAiEditRequest(payload.elementHtml, payload.tagName, payload.prompt);
        }
        break;
    }
  }, [onHtmlChange, handleAiEditRequest]);

  // Set up message listener
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // Send disable message when unmounting or when edit mode is disabled
  useEffect(() => {
    return () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { source: 'element-editor-parent', type: 'disable-edit-mode' },
          '*'
        );
      }
    };
  }, []);

  return (
    <div 
      className="
        h-full
        bg-white
        rounded-lg
        overflow-hidden
        shadow-2xl
        transition-all
        duration-300
        mx-auto
        relative
      "
      style={{ width: deviceWidth, maxWidth: '100%' }}
    >
      {/* Edit mode indicator */}
      <div className={`
        absolute
        top-2
        right-2
        z-10
        px-2
        py-1
        text-xs
        font-semibold
        rounded
        shadow-lg
        pointer-events-none
        flex
        items-center
        gap-1.5
        ${isAiLoading ? 'bg-purple-500 text-white' : 'bg-amber-500 text-amber-950'}
      `}>
        {isAiLoading ? (
          <>
            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            AI Editing...
          </>
        ) : (
          'Edit Mode'
        )}
      </div>

      {/* AI Loading Overlay */}
      {isAiLoading && (
        <div className="absolute inset-0 z-[5] bg-black/10 pointer-events-none" />
      )}

      <iframe
        ref={iframeRef}
        srcDoc={editableHtml}
        title="Editable Landing Page Preview"
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}

