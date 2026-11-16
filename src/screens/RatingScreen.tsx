'use client';

import { EyeOff } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button, Card, StatusPill, Stars } from '@/components/ui';
import { useDemo } from '@/demo/DemoProvider';
import { computeFees, formatMoney } from '@/demo/fees';
import type { Rating } from '@/demo/types';

const first = (name: string) => name.split(' ')[0];
const MAX_REVIEW = 500;

function RatingCard({ from, about, rating }: { from: string; about: string; rating: Rating }) {
  return (
    <Card className="flex flex-col gap-1.5">
      <p className="text-sm text-stone-600">
        {from} rated {about}
      </p>
      <Stars value={rating.stars} />
      {rating.review && <p className="text-stone-800">“{rating.review}”</p>}
    </Card>
  );
}

/** Both phones once the money is released: who got what, then rate each other */
export function RatingScreen() {
  const { state, story, dispatch } = useDemo();
  const [stars, setStars] = useState<Rating['stars'] | 0>(0);
  const [review, setReview] = useState('');
  if (story === null || state.pkg === null) return null;

  const traveler = story.travelers.find((t) => t.id === state.chosenTravelerId) ?? story.travelers[0];
  const fees = state.fees ?? computeFees(state.pkg.reward, story.currency);
  const money = (n: number) => formatMoney(n, story.currency);

  const me = state.view;
  const meName = first(me === 'sender' ? story.sender.name : traveler.name);
  const otherName = first(me === 'sender' ? traveler.name : story.sender.name);
  const mine = state.ratings[me];
  const theirs = state.ratings[me === 'sender' ? 'traveler' : 'sender'];
  const both = mine !== null && theirs !== null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (stars === 0) return;
    const text = review.trim();
    dispatch({ type: 'rate', rating: text ? { stars, review: text } : { stars } });
  };

  return (
    <div className="flex flex-1 flex-col gap-5 p-6">
      <Card className="flex flex-col gap-2 border-released/30 bg-green-50">
        <div>
          <StatusPill tone="released">Released</StatusPill>
        </div>
        <p className="text-stone-800">
          {me === 'sender'
            ? `${first(traveler.name)} receives ${money(fees.reward)} · Yizzo fee ${money(fees.fee)}`
            : `You receive ${money(fees.reward)}`}
        </p>
      </Card>

      {mine === null ? (
        <form onSubmit={submit} className="flex flex-1 flex-col gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Rate {otherName}</h1>
          <Stars value={stars} onChange={setStars} label="Your rating" />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="review" className="text-sm font-medium text-stone-700">
              Review (optional)
            </label>
            <textarea
              id="review"
              rows={3}
              maxLength={MAX_REVIEW}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-base focus:border-brand focus:outline-2 focus:outline-brand/30"
            />
          </div>
          <Button type="submit" disabled={stars === 0} className="mt-auto">
            Submit rating
          </Button>
        </form>
      ) : both ? (
        <div className="flex flex-1 flex-col gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Ratings</h1>
          <RatingCard from={meName} about={otherName} rating={mine} />
          <RatingCard from={otherName} about={meName} rating={theirs} />
          <Button className="mt-auto" onClick={() => dispatch({ type: 'finish' })}>
            See summary
          </Button>
        </div>
      ) : (
        <Card className="flex items-start gap-3">
          <EyeOff aria-hidden className="mt-0.5 size-5 shrink-0 text-stone-500" />
          <p className="text-stone-700">Your rating is hidden until {otherName} rates too.</p>
        </Card>
      )}
    </div>
  );
}
