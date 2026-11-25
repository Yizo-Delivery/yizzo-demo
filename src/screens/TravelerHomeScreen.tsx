'use client';

import { CalendarDays, Inbox, Luggage, MapPin, Plus } from 'lucide-react';
import { Button, Card, StatusPill } from '@/components/ui';
import { formatRange } from '@/demo/dates';
import { useDemo } from '@/demo/DemoProvider';
import { formatMoney } from '@/demo/fees';
import { totalWeight } from '@/demo/matching';
import { reached } from '@/demo/reducer';

const first = (name: string) => name.split(' ')[0];

/** The traveler's phone until the package is paid for: the offer, then their trips */
export function TravelerHomeScreen() {
  const { state, story, dispatch } = useDemo();
  if (story === null) return null;

  const sender = story.sender;
  const hasOffer = reached(state, 'offerSent') && state.pkg !== null;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <section className="flex flex-col gap-3" aria-labelledby="offers-heading">
        <h1 id="offers-heading" className="text-2xl font-bold tracking-tight">
          Offers
        </h1>
        {!hasOffer || state.pkg === null ? (
          <Card className="flex items-center gap-3 text-stone-600">
            <Inbox aria-hidden className="size-6 text-stone-400" />
            No offers yet
          </Card>
        ) : (
          <article
            aria-label={`Offer from ${sender.name}`}
            className="flex flex-col gap-3 rounded-2xl border border-brand/30 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-lg font-semibold">{sender.name}</p>
                <p className="text-sm text-stone-600">
                  {state.pkg.origin} → {state.pkg.destination}
                </p>
              </div>
              <p className="text-lg font-bold text-brand">{formatMoney(state.pkg.reward, story.currency)}</p>
            </div>
            <ul className="flex flex-col gap-1 text-stone-700">
              {state.pkg.items.map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span>
                    {item.name} <span className="text-stone-500">· {item.category}</span>
                  </span>
                  <span>{item.weightKg} kg</span>
                </li>
              ))}
            </ul>
            <p className="text-sm font-semibold">Total: {totalWeight(state.pkg)} kg</p>

            {state.step === 'offerSent' && <Button onClick={() => dispatch({ type: 'acceptOffer' })}>Accept</Button>}
            {state.step === 'offerAccepted' && (
              <div>
                <StatusPill tone="neutral">Waiting for {first(sender.name)} to confirm</StatusPill>
              </div>
            )}
            {state.step === 'confirmed' && (
              <div>
                <StatusPill tone="sent">Confirmed · waiting for payment</StatusPill>
              </div>
            )}
          </article>
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="trips-heading">
        <h2 id="trips-heading" className="text-xl font-bold tracking-tight">
          Your trips
        </h2>
        {state.trips.map((trip, i) => (
          <Card key={i} className="flex flex-col gap-2">
            <p className="flex items-center gap-2 font-semibold">
              <MapPin aria-hidden className="size-5 text-brand" />
              {trip.origin} → {trip.destination}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
              <span className="flex items-center gap-1.5">
                <CalendarDays aria-hidden className="size-4" />
                {formatRange(trip.departure, trip.arrival)}
              </span>
              <span className="flex items-center gap-1.5">
                <Luggage aria-hidden className="size-4" />
                {trip.capacityKg} kg capacity
              </span>
            </div>
          </Card>
        ))}
        <Button variant="secondary" onClick={() => dispatch({ type: 'openPanel', panel: 'postTrip' })}>
          <Plus aria-hidden className="size-5" />
          Post a trip
        </Button>
      </section>
    </div>
  );
}
