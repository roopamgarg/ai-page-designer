/**
 * EditablePreviewFrame Component
 * Responsibility: Render iframe with direct element editing capabilities
 */
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { injectEditorScript, cleanEditorArtifacts } from '@/lib/utils/elementEditorScript';

interface EditablePreviewFrameProps {
  html: string;
  deviceWidth: string;
  onHtmlChange: (html: string) => void;
}

interface EditorMessage {
  source: 'element-editor';
  type: 'editor-ready' | 'element-selected' | 'element-deselected' | 'html-changed';
  payload: {
    html?: string;
    path?: string;
    tagName?: string;
  };
}

export function EditablePreviewFrame({ 
  html, 
  deviceWidth, 
  onHtmlChange 
}: EditablePreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastHtmlRef = useRef<string>(html);

  // Inject editor script into HTML
  const editableHtml = injectEditorScript(html);

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
          lastHtmlRef.current = cleanHtml;
          onHtmlChange(cleanHtml);
        }
        break;
    }
  }, [onHtmlChange]);

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
      <div className="
        absolute
        top-2
        right-2
        z-10
        px-2
        py-1
        bg-amber-500
        text-amber-950
        text-xs
        font-semibold
        rounded
        shadow-lg
        pointer-events-none
      ">
        Edit Mode
      </div>

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

