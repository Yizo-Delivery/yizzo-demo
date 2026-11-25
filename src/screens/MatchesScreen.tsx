'use client';

import { BadgeCheck, CalendarDays, Luggage, PackageSearch } from 'lucide-react';
import { Button, Card, StatusPill, Stars } from '@/components/ui';
import { formatRange } from '@/demo/dates';
import { useDemo } from '@/demo/DemoProvider';
import { matchTravelers, totalWeight } from '@/demo/matching';

export function MatchesScreen() {
  const { state, story, dispatch } = useDemo();
  if (story === null || state.pkg === null) return null;

  const weight = totalWeight(state.pkg);
  const travelers = matchTravelers(story, state.pkg);
  const choosing = state.step === 'matches';

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Travelers for your package</h1>
        <p className="text-slate-600">
          {state.pkg.origin} → {state.pkg.destination} · {weight} kg
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
            <article key={t.id} aria-label={t.name} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <p className="text-lg font-semibold">{t.name}</p>
                  <p className="flex items-center gap-1 text-sm font-medium text-brand">
                    <BadgeCheck aria-hidden className="size-4" />
                    Verified
                  </p>
                </div>
                {i === 0 && (
                  <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-slate-900">Best match</span>
                )}
              </div>
              <p className="flex items-center gap-2 text-sm text-slate-700">
                <Stars value={t.rating} />
                {t.rating.toFixed(1)} · {t.trips} trips
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <CalendarDays aria-hidden className="size-4" />
                  {formatRange(t.departure, t.arrival)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Luggage aria-hidden className="size-4" />
                  {t.spareKg} kg free
                </span>
              </div>
              {sent ? (
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
              )}
            </article>
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
