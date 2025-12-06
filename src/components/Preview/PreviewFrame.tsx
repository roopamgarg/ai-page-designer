/**
 * PreviewFrame Component
 * Responsibility: Render sandboxed iframe with generated HTML
 */
'use client';

interface PreviewFrameProps {
  html: string;
  deviceWidth: string;
}

export function PreviewFrame({ html, deviceWidth }: PreviewFrameProps) {
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
        srcDoc={html}
        title="Landing Page Preview"
        className="w-full h-full border-0"
        sandbox="allow-scripts"
      />
    </div>
  );
}

