'use client';

import { ArrowRight, Car, Plane } from 'lucide-react';
import { useState } from 'react';
import { PaperPlane, Logo } from '@/components/Logo';
import { Sheet } from '@/components/Sheet';
import { Button, cx, useArmed } from '@/components/ui';
import { useDemo } from '@/demo/DemoProvider';
import { DIASPORA, DOMESTIC } from '@/demo/stories';
import type { Story } from '@/demo/types';

const STORIES: { story: Story; Icon: typeof Plane }[] = [
  { story: DIASPORA, Icon: Plane },
  { story: DOMESTIC, Icon: Car },
];

const HAS_PHOTO = process.env.NEXT_PUBLIC_HAS_WELCOME_PHOTO === '1';

function StoryCards() {
  const { dispatch } = useDemo();
  // The sheet opens under the finger that tapped Get Started
  const armed = useArmed();
  return (
    <div className="flex flex-col gap-3">
      {STORIES.map(({ story, Icon }, i) => (
        <button
          key={story.id}
          type="button"
          disabled={!armed}
          onClick={() => dispatch({ type: 'chooseStory', story: story.id })}
          className={cx(
            'group flex items-start gap-3 rounded-[20px] p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
            i === 0 ? 'bg-brand text-white' : 'border border-brand/30 bg-white text-brand',
          )}
        >
          <Icon aria-hidden className="mt-0.5 size-6 shrink-0" />
          <span className="flex flex-1 flex-col gap-1">
            <span className="text-lg font-semibold">{story.title}</span>
            <span className={i === 0 ? 'text-sm text-white/80' : 'text-sm text-slate-600'}>{story.subtitle}</span>
          </span>
          <ArrowRight aria-hidden className="mt-1 size-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </button>
      ))}
    </div>
  );
}

export function WelcomeScreen() {
  const [picking, setPicking] = useState(false);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-brand text-white">
      {HAS_PHOTO ? (
        // eslint-disable-next-line @next/next/no-img-element -- a static export, no image optimizer
        <img src="/welcome.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-brand via-brand to-sky">
          <PaperPlane className="absolute -top-6 -right-10 size-72 rotate-12 text-white/10" />
        </div>
      )}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand via-brand/60 to-transparent" />

      <div className="relative mt-auto flex flex-col gap-6 px-6 pt-48 pb-6">
        <Logo size="lg" tone="white" />
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl leading-tight font-bold">People move the world closer.</h1>
          <p className="text-lg text-white/85">Send packages with travelers already going your way.</p>
        </div>
        <Button variant="secondary" className="border-white" onClick={() => setPicking(true)}>
          Get Started
        </Button>
        <p className="text-center text-sm text-white/75">Demo with sample data</p>
      </div>

      {picking && (
        <Sheet title="Pick a story" onClose={() => setPicking(false)}>
          <p className="text-slate-600">Follow one delivery from both sides.</p>
          <StoryCards />
        </Sheet>
      )}
    </div>
  );
}
