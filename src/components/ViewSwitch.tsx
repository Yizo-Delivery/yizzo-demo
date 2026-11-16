'use client';

import { guideFor } from '@/demo/guide';
import { useDemo } from '@/demo/DemoProvider';
import { reached } from '@/demo/reducer';
import type { View } from '@/demo/types';
import { cx } from './ui';

const first = (name: string) => name.split(' ')[0];

/** Flip between the sender's and the traveler's phone; shown once the account is active */
export function ViewSwitch() {
  const { state, story, dispatch } = useDemo();
  if (story === null || !reached(state, 'post')) return null;

  const traveler = story.travelers.find((t) => t.id === state.chosenTravelerId) ?? story.travelers[0];
  const { who } = guideFor(state, story);
  const options: { view: View; label: string }[] = [
    { view: 'sender', label: `Sender · ${first(story.sender.name)}` },
    { view: 'traveler', label: `Traveler · ${first(traveler.name)}` },
  ];

  return (
    <div role="group" aria-label="Whose phone" className="grid grid-cols-2 gap-1 rounded-2xl bg-stone-100 p-1">
      {options.map(({ view, label }) => {
        const active = state.view === view;
        const wanted = who === view && !active;
        return (
          <button
            key={view}
            type="button"
            aria-pressed={active}
            onClick={() => dispatch({ type: 'switchView', view })}
            className={cx(
              'relative min-h-11 rounded-xl px-2 text-sm font-semibold transition-colors',
              active ? 'bg-white text-brand shadow-sm' : 'text-stone-600 hover:text-brand',
            )}
          >
            {label}
            {wanted && (
              <span aria-hidden className="absolute top-1.5 right-2 size-2.5 animate-pulse rounded-full bg-accent" />
            )}
          </button>
        );
      })}
    </div>
  );
}
