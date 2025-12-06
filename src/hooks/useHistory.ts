/**
 * Custom hook for history management (undo/redo)
 * Responsibility: Track state changes with undo/redo capabilities
 */
'use client';

import { useReducer, useCallback, useRef } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

type HistoryAction<T> =
  | { type: 'SET'; payload: T; skipHistory?: boolean }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR' };

const MAX_HISTORY_SIZE = 50;

function historyReducer<T>(state: HistoryState<T>, action: HistoryAction<T>): HistoryState<T> {
  switch (action.type) {
    case 'SET': {
      if (action.skipHistory) {
        return { ...state, present: action.payload };
      }
      
      // Don't add to history if value hasn't changed
      if (state.present === action.payload) {
        return state;
      }
      
      const newPast = [...state.past, state.present].slice(-MAX_HISTORY_SIZE);
      return {
        past: newPast,
        present: action.payload,
        future: [], // Clear future on new change
      };
    }
    
    case 'UNDO': {
      if (state.past.length === 0) {
        return state;
      }
      
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      
      return {
        past: newPast,
        present: previous,
        future: [state.present, ...state.future],
      };
    }
    
    case 'REDO': {
      if (state.future.length === 0) {
        return state;
      }
      
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      
      return {
        past: [...state.past, state.present],
        present: next,
        future: newFuture,
      };
    }
    
    case 'CLEAR': {
      return {
        past: [],
        present: state.present,
        future: [],
      };
    }
    
    default:
      return state;
  }
}

interface UseHistoryReturn<T> {
  value: T;
  setValue: (newValue: T, recordHistory?: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
  historyLength: number;
}

export function useHistory<T>(initialValue: T): UseHistoryReturn<T> {
  const [state, dispatch] = useReducer(historyReducer<T>, {
    past: [],
    present: initialValue,
    future: [],
  });
  
  // Debounce refs for grouping rapid changes
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRecordedValue = useRef<T>(initialValue);
  const pendingValue = useRef<T | null>(null);
  
  // Threshold for grouping changes (ms)
  const DEBOUNCE_THRESHOLD = 800;

  const setValue = useCallback((newValue: T, recordHistory = true) => {
    if (!recordHistory) {
      dispatch({ type: 'SET', payload: newValue, skipHistory: true });
      return;
    }

    // Clear any pending debounce
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // If we have a pending value, we're in the middle of a debounce
    // Just update the pending value and reset the timer
    if (pendingValue.current !== null) {
      pendingValue.current = newValue;
      dispatch({ type: 'SET', payload: newValue, skipHistory: true });
      
      debounceTimer.current = setTimeout(() => {
        // Debounce finished - record the final value to history
        if (pendingValue.current !== null && pendingValue.current !== lastRecordedValue.current) {
          dispatch({ type: 'SET', payload: pendingValue.current });
          lastRecordedValue.current = pendingValue.current;
        }
        pendingValue.current = null;
      }, DEBOUNCE_THRESHOLD);
    } else {
      // New change - record immediately and start debounce
      dispatch({ type: 'SET', payload: newValue });
      lastRecordedValue.current = newValue;
      pendingValue.current = newValue;
      
      debounceTimer.current = setTimeout(() => {
        pendingValue.current = null;
      }, DEBOUNCE_THRESHOLD);
    }
  }, []);

  const undo = useCallback(() => {
    // Clear any pending debounce before undo
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      pendingValue.current = null;
    }
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    // Clear any pending debounce before redo
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      pendingValue.current = null;
    }
    dispatch({ type: 'REDO' });
  }, []);

  const clear = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    pendingValue.current = null;
    lastRecordedValue.current = state.present;
    dispatch({ type: 'CLEAR' });
  }, [state.present]);

  return {
    value: state.present,
    setValue,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    clear,
    historyLength: state.past.length,
  };
}
