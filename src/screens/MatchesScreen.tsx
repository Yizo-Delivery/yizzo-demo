'use client';

import { CalendarDays, PackageSearch } from 'lucide-react';
import { Flag } from '@/components/Flag';
import { TravelerCard } from '@/components/TravelerCard';
import { Button, Card, StatusPill } from '@/components/ui';
import { formatRange } from '@/demo/dates';
import { useDemo } from '@/demo/DemoProvider';
import { matchTravelers, totalWeight } from '@/demo/matching';

export function MatchesScreen() {
  const { state, story, dispatch } = useDemo();
  if (story === null || state.pkg === null) return null;

  const weight = totalWeight(state.pkg);
  const travelers = matchTravelers(story, state.pkg);
  const choosing = state.step === 'matches';
  const route = story.popularRoutes[0];

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-brand">Available Travelers</h1>
        <p className="flex items-center gap-2 font-semibold text-brand">
          <Flag country={route.from.country} />
          <span>
            {state.pkg.origin} → {state.pkg.destination}
          </span>
          <Flag country={route.to.country} />
        </p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
          <span className="flex items-center gap-1.5">
            <CalendarDays aria-hidden className="size-4 text-sky" />
            {formatRange(state.pkg.preferredDeparture, state.pkg.preferredArrival)}
          </span>
          <span>{weight} kg</span>
          <span className="font-semibold text-brand">
            {travelers.length} {travelers.length === 1 ? 'traveler' : 'travelers'} for your package
          </span>
        </p>
      </div>

      {travelers.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-8 text-center">
          <PackageSearch aria-hidden className="size-10 text-slate-400" />
          <p className="font-semibold">No traveler has room for {weight} kg on this route yet.</p>
          <p className="text-slate-600">Try a lighter package, or split it in two.</p>
        </Card>
      ) : (
        travelers.map((t, i) => {
          const sent = state.chosenTravelerId === t.id;
          return (
            <TravelerCard
              key={t.id}
              traveler={t}
              story={story}
              badge={i === 0 ? 'best' : undefined}
              action={
                sent ? (
                  <div>
                    <StatusPill tone="sent">Offer sent</StatusPill>
                  </div>
                ) : (
                  choosing && (
                    <Button
                      variant={i === 0 ? 'primary' : 'secondary'}
                      onClick={() => dispatch({ type: 'sendOffer', travelerId: t.id })}
                    >
                      Send offer
                    </Button>
                  )
                )
              }
            />
          );
        })
      )}

      {choosing && (
        <Button variant="secondary" className="mt-auto" onClick={() => dispatch({ type: 'editPackage' })}>
          Edit package
        </Button>
      )}
    </div>
  );
}
