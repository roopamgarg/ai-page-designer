/**
 * SectionSelector Component
 * Allows users to select a specific section for targeted editing
 */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Section } from '@/lib/utils/sectionParser';

export type EditTarget = 'entire-page' | string;

interface SectionSelectorProps {
  /** Pre-parsed sections to display */
  sections: Section[];
  selectedTarget: EditTarget;
  onTargetChange: (target: EditTarget) => void;
  disabled?: boolean;
}

export function SectionSelector({
  sections,
  selectedTarget,
  onTargetChange,
  disabled = false,
}: SectionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    if (selectedTarget === 'entire-page') return 'Entire Page';
    const section = sections.find(s => s.id === selectedTarget);
    return section?.name || 'Select Section';
  }, [selectedTarget, sections]);

  // Reset to entire-page if selected section no longer exists
  useEffect(() => {
    if (selectedTarget !== 'entire-page') {
      const sectionExists = sections.some(s => s.id === selectedTarget);
      if (!sectionExists && sections.length > 0) {
        onTargetChange('entire-page');
      }
    }
  }, [sections, selectedTarget, onTargetChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (target: EditTarget) => {
    onTargetChange(target);
    setIsOpen(false);
  };

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          flex
          items-center
          gap-2
          px-3
          py-2
          text-sm
          bg-zinc-800/50
          border
          border-zinc-700
          rounded-lg
          transition-all
          duration-200
          disabled:opacity-50
          disabled:cursor-not-allowed
          ${isOpen ? 'border-amber-500/50 bg-zinc-800' : 'hover:border-zinc-600'}
        `}
      >
        <svg
          className="w-4 h-4 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
          />
        </svg>
        <span className="text-zinc-300 max-w-[120px] truncate">{selectedLabel}</span>
        <svg
          className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="
            absolute
            bottom-full
            left-0
            mb-2
            w-56
            bg-zinc-800
            border
            border-zinc-700
            rounded-xl
            shadow-xl
            overflow-hidden
            z-50
          "
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2">
            <p className="px-2 py-1 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Edit Target
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {/* Entire Page Option */}
            <button
              onClick={() => handleSelect('entire-page')}
              className={`
                w-full
                flex
                items-center
                gap-3
                px-4
                py-2.5
                text-left
                transition-colors
                ${selectedTarget === 'entire-page'
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'text-zinc-300 hover:bg-zinc-700/50'
                }
              `}
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium">Entire Page</p>
                <p className="text-xs text-zinc-500">Edit all sections</p>
              </div>
              {selectedTarget === 'entire-page' && (
                <svg
                  className="w-4 h-4 ml-auto text-amber-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* Divider */}
            <div className="my-1 border-t border-zinc-700" />

            {/* Individual Sections */}
            <p className="px-4 py-1 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Sections ({sections.length})
            </p>
            
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSelect(section.id)}
                className={`
                  w-full
                  flex
                  items-center
                  gap-3
                  px-4
                  py-2.5
                  text-left
                  transition-colors
                  ${selectedTarget === section.id
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-zinc-300 hover:bg-zinc-700/50'
                  }
                `}
              >
                <div
                  className={`
                    w-2 h-2 rounded-full flex-shrink-0
                    ${selectedTarget === section.id ? 'bg-amber-400' : 'bg-zinc-600'}
                  `}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{section.name}</p>
                </div>
                {selectedTarget === section.id && (
                  <svg
                    className="w-4 h-4 flex-shrink-0 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
