'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { demoReducer, initialState } from './reducer';
import { getStory } from './stories';
import type { DemoAction, DemoState, Story } from './types';

interface DemoContextValue {
  state: DemoState;
  story: Story | null;
  dispatch: (action: DemoAction) => void;
  /** Unsaved form input that outlives its screen; see useDraft */
  drafts: Map<string, unknown>;
}

const DemoContext = createContext<DemoContextValue | null>(null);

/** Actions after which unsaved form input no longer applies */
const CLEARS_DRAFTS: ReadonlySet<DemoAction['type']> = new Set(['restart', 'chooseStory', 'postPackage']);

/** Holds the whole demo in memory; a reload or Restart starts over */
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(demoReducer, initialState);
  const [drafts] = useState(() => new Map<string, unknown>());

  const dispatch = useCallback(
    (action: DemoAction) => {
      if (CLEARS_DRAFTS.has(action.type)) drafts.clear();
      rawDispatch(action);
    },
    [drafts],
  );

  const value = useMemo(
    () => ({ state, story: state.storyId ? getStory(state.storyId) : null, dispatch, drafts }),
    [state, dispatch, drafts],
  );
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const value = useContext(DemoContext);
  if (value === null) throw new Error('useDemo must be used inside <DemoProvider>');
  return value;
}

/**
 * Like useState, but the value survives the screen unmounting, so switching
 * to the other phone and back keeps what was typed. Cleared on Restart, on
 * choosing a story, and once the package is posted.
 */
export function useDraft<T>(key: string, initial: () => T): [T, (update: SetStateAction<T>) => void] {
  const { drafts } = useDemo();
  const [value, setValue] = useState<T>(() => (drafts.has(key) ? (drafts.get(key) as T) : initial()));

  const set = useCallback(
    (update: SetStateAction<T>) =>
      setValue((prev) => {
        const next = typeof update === 'function' ? (update as (p: T) => T)(prev) : update;
        drafts.set(key, next);
        return next;
      }),
    [drafts, key],
  );
  return [value, set];
}
