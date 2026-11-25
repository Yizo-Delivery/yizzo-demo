import { BadgeCheck, CalendarDays, Car, Luggage, Plane } from 'lucide-react';
import type { ReactNode } from 'react';
import { formatRange } from '@/demo/dates';
import type { Story, Traveler } from '@/demo/types';
import { Avatar } from './Avatar';
import { Stars } from './ui';

/** One traveler on the story's route; used by Available Travelers and Search */
export function TravelerCard({
  traveler: t,
  story,
  badge,
  action,
}: {
  traveler: Traveler;
  story: Story;
  badge?: 'best';
  action?: ReactNode;
}) {
  const flight = story.mode === 'flight' && story.originCode !== null && story.destinationCode !== null;
  return (
    <article
      aria-label={t.name}
      className="flex flex-col gap-3 rounded-[20px] bg-white p-4 shadow-[0_1px_3px_rgb(11_31_75/0.08),0_4px_16px_rgb(11_31_75/0.06)]"
    >
      <div className="flex items-start gap-3">
        <Avatar name={t.name} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-lg leading-tight font-semibold break-words text-brand">{t.name}</p>
            {badge === 'best' && (
              <span className="shrink-0 rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-white">Best match</span>
            )}
          </div>
          <p className="flex items-center gap-1 text-sm font-medium text-brand">
            <BadgeCheck aria-hidden className="size-4 text-sky" />
            Verified
          </p>
          <p className="flex items-center gap-2 text-sm text-slate-700">
            <Stars value={t.rating} />
            {t.rating.toFixed(1)} · {t.trips} reviews
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 rounded-2xl bg-brand-soft px-3 py-2 text-sm text-brand">
        <span className="flex items-center gap-1.5">
          <CalendarDays aria-hidden className="size-4 text-sky" />
          {formatRange(t.departure, t.arrival)}
        </span>
        {flight ? (
          <span className="flex items-center gap-1.5 font-semibold">
            <Plane aria-hidden className="size-4 text-sky" />
            {story.originCode} → {story.destinationCode}
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <Car aria-hidden className="size-4 text-sky" />
            by car
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Luggage aria-hidden className="size-4 text-sky" />
          {t.spareKg} kg free
        </span>
      </div>
      {action}
    </article>
  );
}
