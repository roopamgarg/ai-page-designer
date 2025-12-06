/**
 * DownloadButton Component
 * Responsibility: Trigger HTML file download
 */
'use client';

import { downloadAsHtml } from '@/lib/utils/download';

interface DownloadButtonProps {
  html: string;
  disabled?: boolean;
}

export function DownloadButton({ html, disabled = false }: DownloadButtonProps) {
  const handleDownload = () => {
    if (html) {
      downloadAsHtml(html);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={disabled || !html}
      className="
        flex
        items-center
        gap-2
        px-5
        py-2.5
        bg-zinc-800
        border
        border-zinc-700
        text-zinc-200
        font-medium
        rounded-xl
        hover:bg-zinc-700
        hover:border-zinc-600
        focus:outline-none
        focus:ring-2
        focus:ring-amber-500/50
        focus:ring-offset-2
        focus:ring-offset-zinc-900
        disabled:opacity-50
        disabled:cursor-not-allowed
        transition-all
        duration-200
      "
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      <span>Download HTML</span>
    </button>
  );
}

