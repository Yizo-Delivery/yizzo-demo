'use client';

import { ArrowRight, BadgeCheck, Car, Handshake, Package, PackagePlus, Plane, ShieldCheck, Star } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { Flag } from '@/components/Flag';
import { useArmed } from '@/components/ui';
import { useDemo } from '@/demo/DemoProvider';
import type { Country } from '@/demo/types';

const COUNTRY: Record<Country, string> = { US: 'USA', GB: 'UK', CA: 'Canada', ET: 'Ethiopia' };

const HOW = [
  { Icon: PackagePlus, text: 'Post your item' },
  { Icon: Handshake, text: 'Match with a verified traveler' },
  { Icon: ShieldCheck, text: 'Pay safely into escrow' },
  { Icon: Star, text: 'Get it delivered and rate' },
];

/** The sender's home once the account is active */
export function HomeScreen() {
  const { state, story, dispatch } = useDemo();
  // The cards sit under the phone screen's Continue button
  const armed = useArmed();
  if (story === null) return null;

  const name = state.account?.name ?? story.sender.name;
  const first = name.trim().split(/\s+/)[0];
  const TravelIcon = story.mode === 'flight' ? Plane : Car;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Avatar name={name} />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight break-all text-brand">Hi, {first}</h1>
          <p className="flex items-center gap-1 text-sm text-slate-600">
            <BadgeCheck aria-hidden className="size-4 text-sky" />
            Verified · Where is your package going?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={!armed}
          onClick={() => dispatch({ type: 'startSend' })}
          className="flex min-h-36 flex-col justify-between gap-3 rounded-[20px] bg-brand p-4 text-left text-white shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <Package aria-hidden className="size-8 text-sky" />
          <span className="flex flex-col gap-1">
            <span className="text-lg leading-tight font-bold">Send an Item</span>
            <span className="text-sm text-white/80">Find a traveler on your route</span>
          </span>
        </button>
        <button
          type="button"
          disabled={!armed}
          onClick={() => dispatch({ type: 'switchView', view: 'traveler' })}
          className="flex min-h-36 flex-col justify-between gap-3 rounded-[20px] bg-brand-soft p-4 text-left text-brand shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <TravelIcon aria-hidden className="size-8 text-sky" />
          <span className="flex flex-col gap-1">
            <span className="text-lg leading-tight font-bold">Traveling Soon?</span>
            <span className="text-sm text-slate-700">Earn by carrying a package</span>
          </span>
        </button>
      </div>

      <section aria-labelledby="routes-heading" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 id="routes-heading" className="text-lg font-bold text-brand">
            Popular routes
          </h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">Sample data</span>
        </div>
        <ul className="flex flex-col gap-2">
          {story.popularRoutes.map((r) => (
            <li
              key={r.to.city + r.from.city}
              className="flex items-center gap-3 rounded-[20px] bg-white p-3 shadow-[0_1px_3px_rgb(11_31_75/0.08)]"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-brand">
                  <Flag country={r.from.country} />
                  {r.from.city}
                  <ArrowRight aria-label="to" className="size-4 shrink-0 text-sky" />
                  <Flag country={r.to.country} />
                  {r.to.city}
                </span>
                <span className="text-xs text-slate-600">
                  {COUNTRY[r.from.country]} → {COUNTRY[r.to.country]} · 50+ active travelers
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-heading" className="flex flex-col gap-3">
        <h2 id="how-heading" className="text-lg font-bold text-brand">
          How Yizzo Works
        </h2>
        <ol className="grid grid-cols-2 gap-3">
          {HOW.map(({ Icon, text }, i) => (
            <li key={text} className="flex flex-col gap-2 rounded-[20px] bg-white p-3 shadow-[0_1px_3px_rgb(11_31_75/0.08)]">
              <span className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-full bg-brand text-sm font-bold text-white">
                  {i + 1}
                </span>
                <Icon aria-hidden className="size-5 text-sky" />
              </span>
              <span className="text-sm font-semibold text-brand">{text}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
