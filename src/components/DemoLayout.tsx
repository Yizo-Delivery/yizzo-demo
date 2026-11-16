'use client';

import { RotateCcw } from 'lucide-react';
import { useDemo } from '@/demo/DemoProvider';
import { guideFor } from '@/demo/guide';
import { ScreenRouter } from '@/screens/ScreenRouter';
import { ViewSwitch } from './ViewSwitch';
import { cx } from './ui';

function RestartButton({ className }: { className?: string }) {
  const { dispatch } = useDemo();
  return (
    <button
      type="button"
      onClick={() => dispatch({ type: 'restart' })}
      className={cx(
        'inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold',
        'focus-visible:outline-2 focus-visible:outline-brand',
        className,
      )}
    >
      <RotateCcw aria-hidden className="size-4" />
      Restart demo
    </button>
  );
}

/**
 * One copy of the app. From 768 px it sits in a phone frame beside the
 * guide; below that it fills the screen under a banner with the next step.
 */
export function DemoLayout() {
  const { state, story } = useDemo();
  const guide = guideFor(state, story);
  const showRestart = state.step !== 'start';

  return (
    <div className="flex min-h-dvh flex-col md:flex-row md:items-center md:justify-center md:gap-12 md:p-8">
      {/* Phone: the next step, pinned on top */}
      <div className="sticky top-0 z-20 flex items-center gap-2 bg-brand px-4 py-2 text-white md:hidden">
        <p className="flex-1 text-sm font-medium" aria-live="polite">
          {guide.next}
        </p>
        {showRestart && <RestartButton className="shrink-0 text-white hover:bg-white/10" />}
      </div>

      {/* The app, framed from 768 px */}
      <div
        className={cx(
          'flex flex-1 flex-col bg-background',
          'md:h-[844px] md:max-h-[calc(100dvh-4rem)] md:w-[390px] md:flex-none md:overflow-hidden',
          'md:rounded-[48px] md:border-[10px] md:border-stone-900 md:shadow-2xl',
        )}
      >
        {state.step !== 'start' && (
          <header className="flex flex-col gap-3 border-b border-stone-200 bg-white px-4 pt-4 pb-3">
            <p className="text-xl font-bold tracking-tight text-brand">Yizzo</p>
            <ViewSwitch />
          </header>
        )}
        <main className="flex flex-1 flex-col overflow-y-auto">
          <ScreenRouter />
        </main>
      </div>

      {/* Laptop: the guide beside the phone */}
      <aside className="hidden w-[340px] flex-col gap-4 md:flex" aria-label="Demo guide">
        {guide.who && (
          <p className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
            {guide.who === 'sender' ? "Sender's turn" : "Traveler's turn"}
          </p>
        )}
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{guide.title}</h2>
        <p className="text-lg leading-relaxed text-stone-600">{guide.body}</p>
        <p className="rounded-2xl border-l-4 border-accent bg-white px-4 py-3 text-base font-semibold text-brand" aria-live="polite">
          {guide.next}
        </p>
        {showRestart && <RestartButton className="self-start text-stone-600 hover:bg-stone-100" />}
      </aside>
    </div>
  );
}
