/**
 * Main Page
 * Responsibility: Page composition and layout
 */
'use client';

import { useState, useEffect } from 'react';
import { PromptForm } from '@/components/PromptForm';
import { Preview } from '@/components/Preview';
import { DownloadButton } from '@/components/DownloadButton';
import { CodeEditor } from '@/components/CodeEditor';
import { ViewToggle, ViewMode } from '@/components/ViewToggle';
import { useGenerateLandingPage } from '@/hooks/useGenerateLandingPage';

export default function Home() {
  const { isLoading, error, generatedHtml, generate, reset } = useGenerateLandingPage();
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [editableHtml, setEditableHtml] = useState<string>('');

  // Sync editableHtml when new content is generated
  useEffect(() => {
    if (generatedHtml) {
      setEditableHtml(generatedHtml);
    }
  }, [generatedHtml]);

  const hasGenerated = generatedHtml !== null;

  const handleReset = () => {
    reset();
    setViewMode('preview');
    setEditableHtml('');
  };

  // Use editableHtml for preview and download (allows edits to reflect)
  const currentHtml = editableHtml || generatedHtml || '';

  return (
    <main className="min-h-screen animated-gradient">
      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-zinc-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-100">
                AI Landing Page Generator
              </h1>
              <p className="text-xs text-zinc-500">Powered by Gemini</p>
            </div>
          </div>

          {hasGenerated && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="
                  px-4
                  py-2
                  text-sm
                  text-zinc-400
                  hover:text-zinc-200
                  transition-colors
                "
              >
                ← New Page
              </button>
              <ViewToggle mode={viewMode} onModeChange={setViewMode} />
              <DownloadButton html={currentHtml} />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {!hasGenerated ? (
          /* Input View */
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 pt-8 pb-4">
              <h2 className="text-4xl sm:text-5xl font-bold">
                <span className="gradient-text">Generate</span>{' '}
                <span className="text-zinc-100">Landing Pages</span>
              </h2>
              <p className="text-lg text-zinc-400 max-w-lg mx-auto">
                Describe your idea and let AI create a beautiful, 
                production-ready landing page in seconds.
              </p>
            </div>

            {/* Form Card */}
            <div className="glass rounded-2xl p-6 sm:p-8 glow">
              <PromptForm onSubmit={generate} isLoading={isLoading} />
              
              {/* Error Display */}
              {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-400">
                        Generation Failed
                      </p>
                      <p className="text-sm text-red-300/80 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-8">
              {[
                {
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  ),
                  title: 'AI-Powered',
                  description: 'Gemini generates unique designs',
                },
                {
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  ),
                  title: 'Edit Code',
                  description: 'Customize the generated HTML',
                },
                {
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  ),
                  title: 'Download Ready',
                  description: 'Get standalone HTML files',
                },
                {
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  ),
                  title: 'Live Preview',
                  description: 'Preview on all device sizes',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="
                    p-5
                    bg-zinc-900/30
                    border
                    border-zinc-800
                    rounded-xl
                    text-center
                  "
                >
                  <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-amber-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {feature.icon}
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-200">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Preview/Edit View */
          <div className="h-[calc(100vh-180px)]">
            {viewMode === 'preview' ? (
              <Preview html={currentHtml} />
            ) : (
              <CodeEditor value={editableHtml} onChange={setEditableHtml} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
