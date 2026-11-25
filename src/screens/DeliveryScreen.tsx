'use client';

import { Check, Circle } from 'lucide-react';
import { Button, Card, StatusPill, cx } from '@/components/ui';
import { useDemo } from '@/demo/DemoProvider';
import { formatMoney } from '@/demo/fees';
import { reached } from '@/demo/reducer';
import type { Step } from '@/demo/types';

const STAGES: { step: Step; label: string; action: string }[] = [
  { step: 'pickedUp', label: 'Picked up', action: 'Mark picked up' },
  { step: 'inTransit', label: 'In transit', action: 'Mark in transit' },
  { step: 'delivered', label: 'Delivered', action: 'Mark delivered' },
];

const first = (name: string) => name.split(' ')[0];

/** Both phones while the package travels: the traveler moves it along, the sender watches */
export function DeliveryScreen() {
  const { state, story, dispatch } = useDemo();
  if (story === null || state.pkg === null) return null;

  const traveler = story.travelers.find((t) => t.id === state.chosenTravelerId) ?? story.travelers[0];
  const next = STAGES.find((s) => !reached(state, s.step));
  const isTraveler = state.view === 'traveler';

  return (
    <div className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Delivery</h1>
        <p className="text-slate-600">
          {state.pkg.origin} → {state.pkg.destination}
          {isTraveler ? ` · for ${story.sender.name}` : ` · with ${traveler.name}`}
        </p>
      </div>

      <Card>
        <ol aria-label="Delivery progress" className="flex flex-col">
          {STAGES.map((s, i) => {
            const done = reached(state, s.step);
            const current = next?.step === s.step;
            return (
              <li
                key={s.step}
                aria-current={current ? 'step' : undefined}
                className="relative flex items-center gap-3 py-2.5"
              >
                {i < STAGES.length - 1 && (
                  <span
                    aria-hidden
                    className={cx('absolute top-9 left-[13px] h-6 w-0.5', done ? 'bg-brand' : 'bg-slate-200')}
                  />
                )}
                <span
                  aria-hidden
                  className={cx(
                    'grid size-7 shrink-0 place-items-center rounded-full',
                    done ? 'bg-brand text-white' : 'border-2 border-slate-300 text-slate-300',
                  )}
                >
                  {done ? <Check className="size-4" /> : <Circle className="size-2 fill-current" />}
                </span>
                <span className={cx('font-medium', done ? 'text-foreground' : 'text-slate-500')}>
                  {s.label}
                  <span className="sr-only">{done ? ' (done)' : ''}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </Card>

      {isTraveler ? (
        <>
          <Card className="flex flex-col gap-2 border-held/30 bg-amber-50">
            <div>
              <StatusPill tone="held">Held</StatusPill>
            </div>
            <p className="text-slate-800">
              Your {formatMoney(state.pkg.reward, story.currency)} reward is held by Yizzo and paid once{' '}
              {first(story.sender.name)} confirms delivery.
            </p>
          </Card>
          {next ? (
            // Keyed by step: each stage gets a fresh button, which the Button's
            // arming delay keeps from catching the second tap of a double tap
            <Button
              key={state.step}
              className="mt-auto"
              onClick={() => dispatch({ type: 'advanceDelivery', from: state.step })}
            >
              {next.action}
            </Button>
          ) : (
            <p className="mt-auto text-center text-slate-600">
              Waiting for {first(story.sender.name)} to confirm delivery
            </p>
          )}
        </>
      ) : (
        <>
          <Card className="flex flex-col gap-2 border-held/30 bg-amber-50">
            <div>
              <StatusPill tone="held">Held</StatusPill>
            </div>
            <p className="text-slate-800">Yizzo keeps the money until you confirm delivery.</p>
          </Card>
          {next ? (
            <p className="mt-auto text-center text-slate-600">
              {first(traveler.name)} updates each step as the package travels.
            </p>
          ) : (
            <Button className="mt-auto" onClick={() => dispatch({ type: 'confirmDelivery' })}>
              Confirm delivery
            </Button>
          )}
        </>
      )}
    </div>
  );
}
