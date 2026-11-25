'use client';

import { MessageCircle, RotateCcw } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useDemo } from '@/demo/DemoProvider';
import { guideFor } from '@/demo/guide';
import { reached } from '@/demo/reducer';
import { ScreenRouter } from '@/screens/ScreenRouter';
import { ViewSwitch } from './ViewSwitch';
import { cx } from './ui';

/** Opens the chat with the other side; there from the first offer on */
function MessageButton() {
  const { state, story, dispatch } = useDemo();
  if (story === null || state.panel !== null || !reached(state, 'offerSent')) return null;

  const traveler = story.travelers.find((t) => t.id === state.chosenTravelerId) ?? story.travelers[0];
  const other = (state.view === 'sender' ? traveler.name : story.sender.name).split(' ')[0];
  return (
    <button
      type="button"
      onClick={() => dispatch({ type: 'openPanel', panel: 'chat' })}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-brand hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-brand"
    >
      <MessageCircle aria-hidden className="size-5" />
      Message {other}
    </button>
  );
}

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
  const { state, story, dispatch } = useDemo();
  const guide = guideFor(state, story);
  const showRestart = state.step !== 'start';
  const main = useRef<HTMLElement>(null);
  const firstScreen = useRef(true);
  // When it's the other side's turn, the phone banner switches to them
  const switchTo = guide.who !== null && guide.who !== state.view && reached(state, 'home') ? guide.who : null;

  // Every new screen starts at the top: the page scrolls on a phone, the
  // app's <main> inside the laptop frame. Focus moves to its heading so a
  // screen reader announces the new screen (not on first load).
  useEffect(() => {
    window.scrollTo(0, 0);
    main.current?.scrollTo(0, 0);
    if (firstScreen.current) {
      firstScreen.current = false;
      return;
    }
    const heading = main.current?.querySelector('h1');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }, [state.step, state.view, state.panel, state.storyId]);

  return (
    <div className="flex min-h-dvh flex-col md:flex-row md:items-center md:justify-center md:gap-12 md:p-8">
      {/* Phone: the next step, pinned on top */}
      <div className="sticky top-0 z-20 flex items-center gap-2 bg-brand px-4 py-2 text-white md:hidden">
        <div className="flex-1" aria-live="polite">
          {switchTo ? (
            <button
              type="button"
              onClick={() => dispatch({ type: 'switchView', view: switchTo })}
              className="min-h-11 w-full text-left text-sm font-medium underline decoration-white/60 underline-offset-4 focus-visible:outline-2 focus-visible:outline-white"
            >
              <span data-testid="next-step">{guide.next}</span>
            </button>
          ) : (
            <p className="text-sm font-medium" data-testid="next-step">
              {guide.next}
            </p>
          )}
        </div>
        {showRestart && <RestartButton className="shrink-0 text-white hover:bg-white/10" />}
      </div>

      {/* The app, framed from 768 px */}
      <div
        className={cx(
          // relative: sheets such as the Fayda sign-in cover the app, not the page
          'relative flex flex-1 flex-col bg-background',
          'md:h-[844px] md:max-h-[calc(100dvh-4rem)] md:w-[390px] md:flex-none md:overflow-hidden',
          'md:rounded-[48px] md:border-[10px] md:border-stone-900 md:shadow-2xl',
        )}
      >
        {state.step !== 'start' && (
          <header className="flex flex-col gap-3 border-b border-stone-200 bg-white px-4 pt-4 pb-3">
            <div className="flex min-h-11 items-center justify-between">
              <p className="text-xl font-bold tracking-tight text-brand">Yizzo</p>
              <MessageButton />
            </div>
            <ViewSwitch />
          </header>
        )}
        <main ref={main} className="flex flex-1 flex-col overflow-y-auto">
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
        <p className="rounded-2xl border-l-4 border-accent bg-white px-4 py-3 text-base font-semibold text-brand"
          aria-live="polite"
          data-testid="next-step"
        >
          {guide.next}
        </p>
        {showRestart && <RestartButton className="self-start text-stone-600 hover:bg-stone-100" />}
      </aside>
    </div>
  );
}
