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
import { addPhoto, allUrls, removeItemPhotos, removePhoto, type PhotoStore } from './photos';
import { demoReducer, initialState } from './reducer';
import { getStory } from './stories';
import type { DemoAction, DemoState, Story } from './types';

interface DemoContextValue {
  state: DemoState;
  story: Story | null;
  dispatch: (action: DemoAction) => void;
  /** Unsaved form input that outlives its screen; see useDraft */
  drafts: Map<string, unknown>;
  photos: PhotoStore;
  setPhotos: (update: (store: PhotoStore) => PhotoStore) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

/** Actions that start a fresh demo: picked photos go too */
const CLEARS_PHOTOS: ReadonlySet<DemoAction['type']> = new Set(['restart', 'chooseStory']);

/** Actions after which unsaved form input no longer applies */
const CLEARS_DRAFTS: ReadonlySet<DemoAction['type']> = new Set(['restart', 'chooseStory', 'postPackage']);

/** Holds the whole demo in memory; a reload or Restart starts over */
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(demoReducer, initialState);
  const [drafts] = useState(() => new Map<string, unknown>());
  const [photos, setPhotos] = useState<PhotoStore>(() => new Map());

  const dispatch = useCallback(
    (action: DemoAction) => {
      if (CLEARS_DRAFTS.has(action.type)) drafts.clear();
      if (CLEARS_PHOTOS.has(action.type)) {
        setPhotos((store) => {
          for (const url of allUrls(store)) URL.revokeObjectURL(url);
          return new Map();
        });
      }
      rawDispatch(action);
    },
    [drafts],
  );

  const value = useMemo(
    () => ({ state, story: state.storyId ? getStory(state.storyId) : null, dispatch, drafts, photos, setPhotos }),
    [state, dispatch, drafts, photos],
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

/**
 * Photos the investor picks for each item. They outlive the form (Find
 * travelers, Edit package) and go on Restart or a new story.
 */
export function usePhotos() {
  const { photos, setPhotos } = useDemo();
  return useMemo(
    () => ({
      photosFor: (itemId: string): readonly string[] => photos.get(itemId) ?? [],
      add(itemId: string, file: File) {
        const url = URL.createObjectURL(file);
        setPhotos((store) => {
          const { store: next, added } = addPhoto(store, itemId, url);
          if (!added) URL.revokeObjectURL(url);
          return next;
        });
      },
      remove(itemId: string, url: string) {
        URL.revokeObjectURL(url);
        setPhotos((store) => removePhoto(store, itemId, url));
      },
      removeItem(itemId: string) {
        setPhotos((store) => {
          const { store: next, revoked } = removeItemPhotos(store, itemId);
          for (const url of revoked) URL.revokeObjectURL(url);
          return next;
        });
      },
    }),
    [photos, setPhotos],
  );
}
