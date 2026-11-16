'use client';

import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import { demoReducer, initialState } from './reducer';
import { getStory } from './stories';
import type { DemoAction, DemoState, Story } from './types';

interface DemoContextValue {
  state: DemoState;
  story: Story | null;
  dispatch: (action: DemoAction) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

/** Holds the whole demo in memory; a reload or Restart starts over */
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, initialState);
  const value = useMemo(
    () => ({ state, story: state.storyId ? getStory(state.storyId) : null, dispatch }),
    [state],
  );
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const value = useContext(DemoContext);
  if (value === null) throw new Error('useDemo must be used inside <DemoProvider>');
  return value;
}
