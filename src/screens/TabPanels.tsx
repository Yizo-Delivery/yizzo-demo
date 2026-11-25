'use client';

import type { ReactNode } from 'react';
import { BadgeCheck, Inbox, MapPin, PackageOpen, Phone, RotateCcw, Star } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { TravelerCard } from '@/components/TravelerCard';
import { Button, Card, StatusPill } from '@/components/ui';
import { formatRange } from '@/demo/dates';
import { useDemo } from '@/demo/DemoProvider';
import { formatMoney } from '@/demo/fees';
import { totalWeight } from '@/demo/matching';
import { reached } from '@/demo/reducer';
import type { DemoState } from '@/demo/types';


function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold tracking-tight text-brand">{title}</h1>
      {children}
    </div>
  );
}

/** Starts the Send form from a tab: only while the sender is still at Home */
function SendButton({ label }: { label: string }) {
  const { state, dispatch } = useDemo();
  if (state.view !== 'sender' || state.step !== 'home') return null;
  return <Button onClick={() => dispatch({ type: 'startSend' })}>{label}</Button>;
}

export function SearchPanel() {
  const { state, story } = useDemo();
  if (story === null) return null;
  const route = `${story.packageDraft.origin} → ${story.packageDraft.destination}`;

  if (state.view === 'traveler') {
    const pkg = reached(state, 'matches') ? state.pkg : null;
    return (
      <Panel title="Search">
        <p className="text-slate-600">Packages on your routes</p>
        {pkg === null ? (
          <Card className="flex items-center gap-3 text-slate-600">
            <Inbox aria-hidden className="size-6 text-slate-400" />
            No packages on your routes yet
          </Card>
        ) : (
          <Card className="flex flex-col gap-2">
            <p className="flex items-center gap-2 font-semibold text-brand">
              <PackageOpen aria-hidden className="size-5 text-sky" />
              {pkg.origin} → {pkg.destination}
            </p>
            <p className="text-sm text-slate-600">
              {story.sender.name} · {totalWeight(pkg)} kg · {formatRange(pkg.preferredDeparture, pkg.preferredArrival)}
            </p>
            <p className="text-lg font-bold text-brand">{formatMoney(pkg.reward, story.currency)}</p>
          </Card>
        )}
      </Panel>
    );
  }

  return (
    <Panel title="Search">
      <p className="text-slate-600">Verified travelers on {route}</p>
      {story.travelers.map((t) => (
        <TravelerCard key={t.id} traveler={t} story={story} />
      ))}
      {state.step === 'home' && <p className="text-slate-600">Post your item to send an offer.</p>}
      <SendButton label="Post your item" />
    </Panel>
  );
}

function deliveryStatus(state: DemoState): { tone: 'sent' | 'held' | 'released'; label: string } {
  if (reached(state, 'released')) return { tone: 'released', label: 'Released' };
  if (reached(state, 'paid')) return { tone: 'held', label: 'Held' };
  if (reached(state, 'confirmed')) return { tone: 'sent', label: 'Confirmed' };
  return { tone: 'sent', label: 'Offer sent' };
}

export function TripsPanel() {
  const { state, story } = useDemo();
  if (story === null) return null;
  const traveler = story.travelers.find((t) => t.id === state.chosenTravelerId) ?? story.travelers[0];
  const other = state.view === 'sender' ? traveler.name : story.sender.name;
  const delivery = reached(state, 'offerSent') && state.pkg !== null ? state.pkg : null;
  const status = deliveryStatus(state);

  return (
    <Panel title="Trips">
      {delivery === null ? (
        <Card className="flex flex-col items-start gap-3">
          <p className="flex items-center gap-3 text-slate-600">
            <Inbox aria-hidden className="size-6 text-slate-400" />
            No deliveries yet
          </p>
          <SendButton label="Send an Item" />
        </Card>
      ) : (
        <Card className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-brand">
              {delivery.origin} → {delivery.destination}
            </p>
            <StatusPill tone={status.tone}>{status.label}</StatusPill>
          </div>
          <p className="text-sm text-slate-600">
            With {other} · {formatMoney(delivery.reward, story.currency)}
          </p>
        </Card>
      )}

      {state.view === 'traveler' && (
        <section aria-labelledby="my-trips" className="flex flex-col gap-3">
          <h2 id="my-trips" className="text-lg font-bold text-brand">
            Your trips
          </h2>
          {state.trips.map((trip, i) => (
            <Card key={i} className="flex flex-col gap-1">
              <p className="flex items-center gap-2 font-semibold text-brand">
                <MapPin aria-hidden className="size-5 text-sky" />
                {trip.origin} → {trip.destination}
              </p>
              <p className="text-sm text-slate-600">
                {formatRange(trip.departure, trip.arrival)} · {trip.capacityKg} kg
              </p>
            </Card>
          ))}
        </section>
      )}
    </Panel>
  );
}

export function ProfilePanel() {
  const { state, story, dispatch } = useDemo();
  if (story === null) return null;
  const traveler = story.travelers.find((t) => t.id === state.chosenTravelerId) ?? story.travelers[0];
  const isSender = state.view === 'sender';
  const name = isSender ? (state.account?.name ?? story.sender.name) : traveler.name;
  const detail = isSender ? (state.account?.email ?? story.sender.email) : traveler.city;
  const { sender, traveler: travelerRating } = state.ratings;
  const revealed = sender !== null && travelerRating !== null;
  // Each side sees the rating the other gave them
  const received = isSender ? travelerRating : sender;

  return (
    <Panel title="Profile">
      <Card className="flex items-center gap-3">
        <Avatar name={name} size="lg" />
        <div className="min-w-0">
          <p className="text-lg font-semibold break-all text-brand">{name}</p>
          <p className="text-sm break-all text-slate-600">{detail}</p>
        </div>
      </Card>
      <Card className="flex flex-col gap-2">
        <p className="flex items-center gap-2 font-medium text-brand">
          <BadgeCheck aria-hidden className="size-5 text-sky" />
          Fayda verified
        </p>
        <p className="flex items-center gap-2 font-medium text-brand">
          <Phone aria-hidden className="size-5 text-sky" />
          Phone confirmed
        </p>
        {revealed && received !== null && (
          <p className="flex items-center gap-2 font-medium text-brand">
            <Star aria-hidden className="size-5 fill-accent text-accent" />
            Your rating: {received.stars}★
          </p>
        )}
      </Card>
      <button
        type="button"
        onClick={() => dispatch({ type: 'restart' })}
        className="inline-flex min-h-11 items-center gap-1.5 self-start rounded-xl px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-brand"
      >
        <RotateCcw aria-hidden className="size-4" />
        Restart demo
      </button>
    </Panel>
  );
}
