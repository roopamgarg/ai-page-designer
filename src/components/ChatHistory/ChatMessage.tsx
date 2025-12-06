/**
 * ChatMessage Component
 * Responsibility: Render a single chat message with markdown support
 */
'use client';

import { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
  onViewHtml?: (html: string) => void;
}

/**
 * Simple markdown-like renderer for chat messages
 * Supports: **bold**, bullet points (- or •)
 */
function renderContent(content: string) {
  const lines = content.split('\n');
  
  return lines.map((line, lineIndex) => {
    // Check if it's a bullet point
    const bulletMatch = line.match(/^[\-•]\s*(.+)$/);
    
    if (bulletMatch) {
      return (
        <div key={lineIndex} className="flex items-start gap-2 ml-1">
          <span className="text-amber-400 mt-0.5">•</span>
          <span>{renderInlineMarkdown(bulletMatch[1])}</span>
        </div>
      );
    }
    
    // Regular line with inline markdown
    return (
      <div key={lineIndex} className={lineIndex > 0 ? 'mt-1' : ''}>
        {renderInlineMarkdown(line)}
      </div>
    );
  });
}

/**
 * Render inline markdown (bold text)
 */
function renderInlineMarkdown(text: string) {
  // Split by **bold** patterns
  const parts = text.split(/\*\*(.+?)\*\*/g);
  
  return parts.map((part, index) => {
    // Every odd index is a bold match
    if (index % 2 === 1) {
      return (
        <strong key={index} className="font-semibold text-zinc-100">
          {part}
        </strong>
      );
    }
    return part;
  });
}

export function ChatMessage({ message, onViewHtml }: ChatMessageProps) {
  const isUser = message.role === 'user';

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`
          flex-shrink-0
          w-8
          h-8
          rounded-lg
          flex
          items-center
          justify-center
          ${isUser 
            ? 'bg-amber-500/20 text-amber-400' 
            : 'bg-zinc-700 text-zinc-300'
          }
        `}
      >
        {isUser ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div
          className={`
            inline-block
            px-4
            py-2.5
            rounded-2xl
            text-sm
            ${isUser
              ? 'bg-amber-500/20 text-zinc-100 rounded-tr-sm'
              : 'bg-zinc-800 text-zinc-300 rounded-tl-sm'
            }
          `}
        >
          <div className="space-y-0.5">
            {renderContent(message.content)}
          </div>
          
          {/* View HTML button for assistant messages */}
          {!isUser && message.html && onViewHtml && (
            <button
              onClick={() => onViewHtml(message.html!)}
              className="
                mt-2
                flex
                items-center
                gap-1.5
                text-xs
                text-amber-400
                hover:text-amber-300
                transition-colors
              "
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View this version
            </button>
          )}
        </div>
        <p className={`text-xs text-zinc-600 mt-1 ${isUser ? 'mr-1' : 'ml-1'}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
