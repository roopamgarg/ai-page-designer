/**
 * Main Page
 * Responsibility: Page composition and layout
 */
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PromptForm } from '@/components/PromptForm';
import { Preview } from '@/components/Preview';
import { DownloadButton } from '@/components/DownloadButton';
import { CodeEditor } from '@/components/CodeEditor';
import { ViewToggle, ViewMode } from '@/components/ViewToggle';
import { FollowUpPrompt } from '@/components/FollowUpPrompt';
import { ChatHistory } from '@/components/ChatHistory';
import { SectionSelector, EditTarget } from '@/components/SectionSelector';
import { ChatModeToggle } from '@/components/ChatModeToggle';
import { useGenerateLandingPage } from '@/hooks/useGenerateLandingPage';
import { parseSections, Section } from '@/lib/utils/sectionParser';
import { ChatMode } from '@/types';

export default function Home() {
  const { isLoading, error, generatedHtml, messages, generate, edit, editSection, ask, reset } = useGenerateLandingPage();
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [editableHtml, setEditableHtml] = useState<string>('');
  const [showChat, setShowChat] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget>('entire-page');
  const [chatMode, setChatMode] = useState<ChatMode>('edit');
  
  // Parse sections once and share between selector and submit handler
  const currentSections = useMemo<Section[]>(() => {
    if (!editableHtml) return [];
    return parseSections(editableHtml);
  }, [editableHtml]);

  // Sync editableHtml when new content is generated
  useEffect(() => {
    if (generatedHtml) {
      setEditableHtml(generatedHtml);
    }
  }, [generatedHtml]);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Prevent body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const hasGenerated = generatedHtml !== null;

  const handleReset = () => {
    reset();
    setViewMode('preview');
    setEditableHtml('');
  };

  const handleFollowUpSubmit = (prompt: string) => {
    // Handle ask mode - just ask a question without editing
    if (chatMode === 'ask') {
      ask(editableHtml, prompt);
      return;
    }

    // Handle edit mode
    if (editTarget === 'entire-page') {
      // Edit entire page
      edit(editableHtml, prompt);
    } else {
      // Edit specific section - use the cached sections
      const section = currentSections.find(s => s.id === editTarget);
      
      if (section) {
        editSection({
          fullHtml: editableHtml,
          sectionId: editTarget,
          sectionName: section.name,
          editPrompt: prompt,
        });
      } else {
        // Fallback to full page edit if section not found
        console.warn(`Section "${editTarget}" not found, falling back to full page edit`);
        edit(editableHtml, prompt);
      }
    }
  };

  const handleViewVersion = (html: string) => {
    setEditableHtml(html);
    setViewMode('preview');
  };

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Use editableHtml for preview and download (allows edits to reflect)
  const currentHtml = editableHtml || generatedHtml || '';

  return (
    <main className="min-h-screen animated-gradient">
      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-zinc-950">
          {/* Fullscreen Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-zinc-950 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-zinc-900"
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
              <span className="text-sm font-medium text-zinc-300">Fullscreen Preview</span>
            </div>
            
            <div className="flex items-center gap-2">
              <DownloadButton html={currentHtml} />
              <button
                onClick={toggleFullscreen}
                className="
                  flex
                  items-center
                  gap-2
                  px-4
                  py-2
                  text-sm
                  bg-zinc-800
                  border
                  border-zinc-700
                  text-zinc-200
                  rounded-lg
                  hover:bg-zinc-700
                  transition-all
                  duration-200
                "
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Exit Fullscreen
              </button>
            </div>
          </div>

          {/* Fullscreen Preview Content */}
          <div className="h-full pt-16">
            <iframe
              srcDoc={currentHtml}
              title="Fullscreen Preview"
              className="w-full h-full border-0 bg-white"
            />
          </div>

          {/* ESC hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-zinc-800/80 backdrop-blur-sm border border-zinc-700 rounded-full text-xs text-zinc-400">
            Press <kbd className="px-1.5 py-0.5 mx-1 bg-zinc-700 rounded text-zinc-300">ESC</kbd> to exit fullscreen
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
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
              
              {/* Toggle Chat Button */}
              <button
                onClick={() => setShowChat(!showChat)}
                className={`
                  flex
                  items-center
                  gap-2
                  px-3
                  py-2
                  text-sm
                  rounded-lg
                  border
                  transition-all
                  duration-200
                  ${showChat
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'text-zinc-400 border-zinc-700 hover:text-zinc-200 hover:border-zinc-600'
                  }
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="hidden sm:inline">Chat</span>
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="
                  flex
                  items-center
                  gap-2
                  px-3
                  py-2
                  text-sm
                  text-zinc-400
                  border
                  border-zinc-700
                  rounded-lg
                  hover:text-zinc-200
                  hover:border-zinc-600
                  transition-all
                  duration-200
                "
                title="Fullscreen preview"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
                <span className="hidden sm:inline">Fullscreen</span>
              </button>
              
              <ViewToggle mode={viewMode} onModeChange={setViewMode} />
              <DownloadButton html={currentHtml} />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
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
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  ),
                  title: 'Iterate with AI',
                  description: 'Refine with follow-up prompts',
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
          /* Split View: Chat + Preview/Editor */
          <div className="flex gap-4 h-[calc(100vh-140px)]">
            {/* Chat Panel */}
            {showChat && (
              <div className="w-96 flex-shrink-0 flex flex-col glass rounded-xl border border-zinc-700/50">
                {/* Chat Header */}
                <div className="px-4 py-3 border-b border-zinc-700/50">
                  <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    Conversation
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {messages.length} message{messages.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 min-h-0">
                  <ChatHistory
                    messages={messages}
                    isLoading={isLoading}
                    onViewVersion={handleViewVersion}
                  />
                </div>

                {/* Chat Input with Mode Toggle and Section Selector */}
                <div className="p-3 border-t border-zinc-700/50 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <ChatModeToggle
                      mode={chatMode}
                      onModeChange={setChatMode}
                      disabled={isLoading}
                    />
                    {chatMode === 'edit' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">Target:</span>
                        <SectionSelector
                          sections={currentSections}
                          selectedTarget={editTarget}
                          onTargetChange={setEditTarget}
                          disabled={isLoading}
                        />
                      </div>
                    )}
                  </div>
                  <FollowUpPrompt 
                    onSubmit={handleFollowUpSubmit} 
                    isLoading={isLoading}
                    placeholder={chatMode === 'ask' 
                      ? "Ask a question about the page..." 
                      : "Describe what you'd like to change..."
                    }
                  />
                </div>
              </div>
            )}

            {/* Preview/Editor Panel */}
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex-1 min-h-0">
                {viewMode === 'preview' ? (
                  <Preview html={currentHtml} />
                ) : (
                  <CodeEditor value={editableHtml} onChange={setEditableHtml} />
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
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
                      <p className="text-sm font-medium text-red-400">Error</p>
                      <p className="text-sm text-red-300/80 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </main>
  );
}
