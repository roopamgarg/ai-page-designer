/**
 * UndoRedoButtons Component
 * Responsibility: Render undo and redo buttons for history navigation
 */
'use client';

interface UndoRedoButtonsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  disabled?: boolean;
}

export function UndoRedoButtons({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  disabled = false,
}: UndoRedoButtonsProps) {
  const buttonBaseClasses = `
    flex
    items-center
    justify-center
    w-9
    h-9
    rounded-lg
    border
    transition-all
    duration-200
  `;

  const enabledClasses = `
    text-zinc-400
    border-zinc-700
    hover:text-zinc-200
    hover:border-zinc-600
    hover:bg-zinc-800/50
  `;

  const disabledClasses = `
    text-zinc-600
    border-zinc-800
    cursor-not-allowed
    opacity-50
  `;

  return (
    <div className="flex items-center gap-1">
      {/* Undo Button */}
      <button
        onClick={onUndo}
        disabled={disabled || !canUndo}
        className={`
          ${buttonBaseClasses}
          ${canUndo && !disabled ? enabledClasses : disabledClasses}
        `}
        title={canUndo ? 'Undo (Ctrl+Z)' : 'Nothing to undo'}
        aria-label="Undo"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
      </button>

      {/* Redo Button */}
      <button
        onClick={onRedo}
        disabled={disabled || !canRedo}
        className={`
          ${buttonBaseClasses}
          ${canRedo && !disabled ? enabledClasses : disabledClasses}
        `}
        title={canRedo ? 'Redo (Ctrl+Shift+Z)' : 'Nothing to redo'}
        aria-label="Redo"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
          />
        </svg>
      </button>
    </div>
  );
}

