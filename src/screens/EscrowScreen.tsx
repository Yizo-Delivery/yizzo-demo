'use client';

import { BadgeCheck, Lock } from 'lucide-react';
import { Button, Card, StatusPill, Stars } from '@/components/ui';
import { formatRange } from '@/demo/dates';
import { useDemo } from '@/demo/DemoProvider';
import { computeFees, FEE_PERCENT, formatMoney, TAX_PERCENT } from '@/demo/fees';
import type { Currency, Fees } from '@/demo/types';

export function PaymentTable({ fees, currency }: { fees: Fees; currency: Currency }) {
  const rows: [string, number][] = [
    ['Reward', fees.reward],
    [`Yizzo fee (${FEE_PERCENT}%)`, fees.fee],
    [`Tax (${TAX_PERCENT}%)`, fees.tax],
  ];
  return (
    <table aria-label="Payment" className="w-full text-left">
      <tbody>
        {rows.map(([label, amount]) => (
          <tr key={label} className="border-b border-stone-100">
            <th scope="row" className="py-2 font-normal text-stone-600">
              {label}
            </th>
            <td className="py-2 text-right tabular-nums">{formatMoney(amount, currency)}</td>
          </tr>
        ))}
        <tr>
          <th scope="row" className="pt-3 text-lg font-bold">
            Total
          </th>
          <td className="pt-3 text-right text-lg font-bold tabular-nums">{formatMoney(fees.total, currency)}</td>
        </tr>
      </tbody>
    </table>
  );
}

const first = (name: string) => name.split(' ')[0];

/** The sender's phone from the traveler accepting until the money is held */
export function EscrowScreen() {
  const { state, story, dispatch } = useDemo();
  if (story === null || state.pkg === null) return null;

  const traveler = story.travelers.find((t) => t.id === state.chosenTravelerId) ?? story.travelers[0];
  const name = first(traveler.name);
  const fees = state.fees ?? computeFees(state.pkg.reward, story.currency);

  if (state.step === 'offerAccepted') {
    return (
      <div className="flex flex-1 flex-col gap-5 p-6">
        <h1 className="text-2xl font-bold tracking-tight">{name} accepted your offer</h1>
        <Card className="flex flex-col gap-2">
          <p className="text-lg font-semibold">{traveler.name}</p>
          <p className="flex items-center gap-1 text-sm font-medium text-brand">
            <BadgeCheck aria-hidden className="size-4" />
            Verified
          </p>
          <p className="flex items-center gap-2 text-sm text-stone-700">
            <Stars value={traveler.rating} />
            {traveler.rating.toFixed(1)} · {traveler.trips} trips
          </p>
          <p className="text-sm text-stone-600">Travels {formatRange(traveler.departure, traveler.arrival)}</p>
        </Card>
        <p className="text-stone-600">Confirming books your package onto {name}&apos;s trip.</p>
        <Button className="mt-auto" onClick={() => dispatch({ type: 'confirmTraveler' })}>
          Confirm {name}
        </Button>
      </div>
    );
  }

  const paid = state.fees !== null;

  return (
    <div className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{paid ? 'Payment held' : 'Pay into escrow'}</h1>
        <p className="text-stone-600">
          {name} carries your package. You pay Yizzo now; {name} is paid when it arrives.
        </p>
      </div>

      <Card>
        <PaymentTable fees={fees} currency={story.currency} />
      </Card>

      {paid ? (
        <Card className="flex flex-col gap-2 border-held/30 bg-amber-50">
          <div>
            <StatusPill tone="held">Held</StatusPill>
          </div>
          <p className="text-stone-800">Yizzo keeps the money until you confirm delivery.</p>
        </Card>
      ) : (
        <Button className="mt-auto" onClick={() => dispatch({ type: 'payEscrow' })}>
          <Lock aria-hidden className="size-5" />
          Pay {formatMoney(fees.total, story.currency)} into escrow
        </Button>
      )}
    </div>
  );
}
