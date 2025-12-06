/**
 * PreviewFrame Component
 * Responsibility: Render sandboxed iframe with generated HTML
 */
'use client';

import { useRef, useEffect } from 'react';

interface PreviewFrameProps {
  html: string;
  deviceWidth: string;
}

export function PreviewFrame({ html, deviceWidth }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scrollPositionRef = useRef<{ x: number; y: number } | null>(null);
  const previousHtmlRef = useRef<string>('');

  // Save scroll position before HTML changes
  useEffect(() => {
    if (previousHtmlRef.current && previousHtmlRef.current !== html) {
      try {
        const iframe = iframeRef.current;
        if (iframe?.contentWindow) {
          scrollPositionRef.current = {
            x: iframe.contentWindow.scrollX || 0,
            y: iframe.contentWindow.scrollY || 0,
          };
        }
      } catch (e) {
        // Cross-origin or other error, ignore
      }
    }
    previousHtmlRef.current = html;
  }, [html]);

  // Restore scroll position after iframe loads
  const handleLoad = () => {
    const savedScroll = scrollPositionRef.current;
    if (!savedScroll) return;
    
    try {
      const iframe = iframeRef.current;
      if (iframe?.contentWindow && iframe.contentDocument) {
        // Wait for content to be fully rendered
        const restoreScroll = () => {
          if (iframe.contentWindow && scrollPositionRef.current) {
            iframe.contentWindow.scrollTo(
              scrollPositionRef.current.x,
              scrollPositionRef.current.y
            );
            scrollPositionRef.current = null;
          }
        };
        
        // Try immediately
        restoreScroll();
        
        // Also try after a short delay in case content isn't ready
        setTimeout(restoreScroll, 10);
        setTimeout(restoreScroll, 50);
      }
    } catch (e) {
      // Cross-origin or other error, ignore
      scrollPositionRef.current = null;
    }
  };

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
      "
      style={{ width: deviceWidth, maxWidth: '100%' }}
    >
      <iframe
        ref={iframeRef}
        srcDoc={html}
        title="Landing Page Preview"
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
        onLoad={handleLoad}
      />
    </div>
  );
}

