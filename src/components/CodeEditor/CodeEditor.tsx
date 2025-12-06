/**
 * CodeEditor Component
 * Responsibility: Render editable code textarea
 */
'use client';

import { ChangeEvent } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CodeEditor({ value, onChange }: CodeEditorProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="h-full flex flex-col rounded-xl overflow-hidden border border-zinc-700">
      {/* Editor Header */}
      <div className="
        flex
        items-center
        gap-2
        px-4
        py-2
        bg-zinc-800/80
        border-b
        border-zinc-700
      ">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-zinc-500 ml-2">index.html</span>
      </div>

      {/* Editor Body */}
      <div className="flex-1 relative bg-zinc-900/50">
        <textarea
          value={value}
          onChange={handleChange}
          spellCheck={false}
          className="
            absolute
            inset-0
            w-full
            h-full
            p-4
            bg-transparent
            text-zinc-300
            font-mono
            text-sm
            leading-relaxed
            resize-none
            focus:outline-none
            placeholder:text-zinc-600
          "
          placeholder="Your HTML code will appear here..."
        />
      </div>

      {/* Editor Footer */}
      <div className="
        flex
        items-center
        justify-between
        px-4
        py-2
        bg-zinc-800/50
        border-t
        border-zinc-700
        text-xs
        text-zinc-500
      ">
        <span>HTML</span>
        <span>{value.length.toLocaleString()} characters</span>
      </div>
    </div>
  );
}

