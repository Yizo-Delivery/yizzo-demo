'use client';

import { ArrowRight, Plane, Car } from 'lucide-react';
import { useDemo } from '@/demo/DemoProvider';
import { DIASPORA, DOMESTIC } from '@/demo/stories';
import type { Story } from '@/demo/types';

const STORIES: { story: Story; Icon: typeof Plane }[] = [
  { story: DIASPORA, Icon: Plane },
  { story: DOMESTIC, Icon: Car },
];

export function StartScreen() {
  const { dispatch } = useDemo();

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 pt-12 pb-6">
      <div className="flex flex-col gap-3">
        <p className="text-4xl font-bold tracking-tight text-brand">Yizzo</p>
        <p className="text-xl leading-snug font-medium">Send packages with travelers already going there.</p>
        <p className="text-stone-600">Pick a story and follow one delivery from both sides.</p>
      </div>

      <div className="flex flex-col gap-3">
        {STORIES.map(({ story, Icon }, i) => (
          <button
            key={story.id}
            type="button"
            onClick={() => dispatch({ type: 'chooseStory', story: story.id })}
            className={
              i === 0
                ? 'group flex items-start gap-3 rounded-2xl bg-brand p-4 text-left text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
                : 'group flex items-start gap-3 rounded-2xl border border-brand/30 bg-white p-4 text-left text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
            }
          >
            <Icon aria-hidden className="mt-0.5 size-6 shrink-0" />
            <span className="flex flex-1 flex-col gap-1">
              <span className="text-lg font-semibold">{story.title}</span>
              <span className={i === 0 ? 'text-sm text-white/80' : 'text-sm text-stone-600'}>{story.subtitle}</span>
            </span>
            <ArrowRight aria-hidden className="mt-1 size-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>

      <p className="mt-auto text-center text-sm text-stone-500">Demo with sample data</p>
    </div>
  );
}
