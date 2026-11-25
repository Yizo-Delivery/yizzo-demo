'use client';

import { useState, type FormEvent } from 'react';
import { Button, Field } from '@/components/ui';
import { addDays } from '@/demo/dates';
import { useDemo } from '@/demo/DemoProvider';

const MAX_CAPACITY_KG = 50;

export function PostTripScreen() {
  const { state, story, dispatch } = useDemo();
  const base = state.trips[0] ?? story?.travelerTrips[0];
  const [origin, setOrigin] = useState(base?.origin ?? '');
  const [destination, setDestination] = useState(base?.destination ?? '');
  const [departure, setDeparture] = useState(base ? addDays(base.departure, 7) : '');
  const [arrival, setArrival] = useState(base ? addDays(base.arrival, 7) : '');
  const [capacity, setCapacity] = useState('10');

  const capacityKg = capacity.trim() === '' ? NaN : Number(capacity);
  const capacityOk = capacityKg > 0 && capacityKg <= MAX_CAPACITY_KG;
  const datesOk = departure !== '' && arrival !== '' && arrival >= departure;
  const valid = origin.trim() !== '' && destination.trim() !== '' && datesOk && capacityOk;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    dispatch({
      type: 'postTrip',
      trip: { origin: origin.trim(), destination: destination.trim(), departure, arrival, capacityKg },
    });
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Post a trip</h1>
        <p className="text-slate-600">Senders on your route will be able to offer you packages.</p>
      </div>
      <Field label="From" value={origin} onChange={(e) => setOrigin(e.target.value)} />
      <Field label="To" value={destination} onChange={(e) => setDestination(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Leave" type="date" value={departure} onChange={(e) => setDeparture(e.target.value)} />
        <Field
          label="Arrive"
          type="date"
          value={arrival}
          onChange={(e) => setArrival(e.target.value)}
          error={departure && arrival && arrival < departure ? 'Arrival must be on or after departure' : null}
        />
      </div>
      <Field
        label="Space for packages (kg)"
        type="number"
        inputMode="decimal"
        min={1}
        max={MAX_CAPACITY_KG}
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
        error={capacityOk ? null : `Enter between 1 and ${MAX_CAPACITY_KG} kg`}
      />
      <div className="mt-auto flex flex-col gap-2">
        <Button type="submit" disabled={!valid}>
          Save trip
        </Button>
        <Button variant="secondary" onClick={() => dispatch({ type: 'closePanel' })}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
