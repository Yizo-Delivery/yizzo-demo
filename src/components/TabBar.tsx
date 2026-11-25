'use client';

import { Home, Plus, Route, Search, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useDemo } from '@/demo/DemoProvider';
import { isTabPanel, reached } from '@/demo/reducer';
import type { TabPanel } from '@/demo/types';
import { Sheet } from './Sheet';
import { Button, cx, useArmed } from './ui';

const TABS: { name: string; panel: TabPanel | null; Icon: typeof Home }[] = [
  { name: 'Home', panel: null, Icon: Home },
  { name: 'Search', panel: 'search', Icon: Search },
  { name: 'Trips', panel: 'trips', Icon: Route },
  { name: 'Profile', panel: 'profile', Icon: UserRound },
];

/** The app's bottom tabs; from Home on, except in the Send form, chat and Post a trip */
export function TabBar() {
  const { state } = useDemo();
  const hidden =
    !reached(state, 'home') ||
    state.panel === 'chat' ||
    state.panel === 'postTrip' ||
    (state.view === 'sender' && state.step === 'post' && state.panel === null);
  if (hidden) return null;
  return <Tabs />;
}

function Tabs() {
  const { state, dispatch } = useDemo();
  // It appears where the phone screen's Continue button was
  const armed = useArmed();
  const [explaining, setExplaining] = useState(false);
  const active = isTabPanel(state.panel) ? state.panel : null;

  const onNew = () => {
    if (state.view === 'traveler') dispatch({ type: 'openPanel', panel: 'postTrip' });
    else if (state.step === 'home') dispatch({ type: 'startSend' });
    else setExplaining(true);
  };

  const tabButton = ({ name, panel, Icon }: (typeof TABS)[number]) => {
    const on = active === panel;
    return (
      <button
        key={name}
        type="button"
        disabled={!armed}
        aria-current={on ? 'page' : undefined}
        onClick={() => dispatch(panel === null ? { type: 'closePanel' } : { type: 'openPanel', panel })}
        className={cx(
          'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-semibold focus-visible:outline-2 focus-visible:outline-brand',
          on ? 'text-brand' : 'text-slate-500 hover:text-brand',
        )}
      >
        <Icon aria-hidden className={cx('size-6', on && 'text-sky')} />
        {name}
      </button>
    );
  };

  return (
    <>
      <nav
        aria-label="Tabs"
        className="sticky bottom-0 z-10 flex items-end gap-1 border-t border-slate-200 bg-white px-2 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]"
      >
        {TABS.slice(0, 2).map(tabButton)}
        <div className="flex flex-1 justify-center">
          <button
            type="button"
            disabled={!armed}
            aria-label="New"
            onClick={onNew}
            className="-mt-6 grid size-14 place-items-center rounded-full bg-brand text-white shadow-lg ring-4 ring-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <Plus aria-hidden className="size-7" />
          </button>
        </div>
        {TABS.slice(2).map(tabButton)}
      </nav>
      {explaining && (
        <Sheet title="One package at a time in the demo" onClose={() => setExplaining(false)}>
          <p className="text-slate-600">This demo follows a single delivery. Restart it to send another one.</p>
          <Button onClick={() => setExplaining(false)}>Back to my package</Button>
        </Sheet>
      )}
    </>
  );
}
