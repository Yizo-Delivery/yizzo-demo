'use client';

import { CalendarDays, ImagePlus, MapPin, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useRef, type FormEvent } from 'react';
import { Stepper } from '@/components/Stepper';
import { Button, Card, Field, cx } from '@/components/ui';
import { formatRange } from '@/demo/dates';
import { useDemo, useDraft, usePhotos } from '@/demo/DemoProvider';
import { computeFees, formatMoney } from '@/demo/fees';
import { MAX_ITEM_KG, MAX_ITEMS, MIN_ITEM_KG, totalWeight, validatePackage } from '@/demo/matching';
import { MAX_PICKED } from '@/demo/photos';
import type { Item, ItemCategory, PackageDraft } from '@/demo/types';
import { PaymentTable } from './EscrowScreen';

const CATEGORIES: ItemCategory[] = ['Documents', 'Package', 'Clothing', 'Fragile', 'Food', 'Electronics', 'Other'];
const STEPS = ['Item details', 'Preferences', 'Review'];
/** Errors that belong to the Preferences step; the rest are Item details' */
const PREFERENCE_ERRORS = new Set(['Enter a reward']);

/** What the inputs hold: numbers as typed, so a half-typed "0." isn't lost */
interface ItemForm extends Omit<Item, 'weightKg' | 'value'> {
  key: number;
  weight: string;
  value: string;
}

const toNumber = (s: string) => (s.trim() === '' ? NaN : Number(s));
const weightOk = (s: string) => {
  const n = toNumber(s);
  return n >= MIN_ITEM_KG && n <= MAX_ITEM_KG;
};
const valueOk = (s: string) => toNumber(s) >= 0;

/** The item's pictures: its bundled illustration, then any the investor picked */
function ItemPhotos({ item }: { item: ItemForm }) {
  const photos = usePhotos();
  const picked = photos.photosFor(item.id);
  const label = item.name.trim() || 'this item';
  const all = [item.photo, ...picked];

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-medium text-slate-700">Photos</p>
      <div className="flex flex-wrap gap-2">
        {all.map((src, i) => (
          <div key={src} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- local files and object URLs */}
            <img
              src={src}
              alt={`Photo ${i + 1} of ${label}`}
              className="size-20 rounded-2xl border border-slate-200 bg-brand-soft object-cover"
            />
            {i > 0 && (
              <button
                type="button"
                aria-label={`Remove photo ${i + 1}`}
                onClick={() => photos.remove(item.id, src)}
                className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full bg-brand text-white shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <X aria-hidden className="size-4" />
              </button>
            )}
          </div>
        ))}
        {picked.length < MAX_PICKED && (
          <label className="grid size-20 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-sky/60 text-sky focus-within:outline-2 focus-within:outline-brand hover:bg-brand-soft">
            <ImagePlus aria-hidden className="size-7" />
            <input
              type="file"
              accept="image/*"
              aria-label={`Add photo for ${label}`}
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) photos.add(item.id, file);
                e.target.value = ''; // so the same file can be picked again
              }}
            />
          </label>
        )}
      </div>
      <p className="text-xs text-slate-600">
        {picked.length >= MAX_PICKED ? 'Up to 3 photos per item.' : 'Up to 3 photos. They stay on this device.'}
      </p>
    </div>
  );
}

export function SendItemScreen() {
  const { state, story, dispatch } = useDemo();
  const photos = usePhotos();
  const start = state.pkg ?? story!.packageDraft;
  // Drafts, not plain state: edits survive switching to the traveler's phone and back
  const [items, setItems] = useDraft<ItemForm[]>('package.items', () =>
    start.items.map((item, i) => ({ ...item, key: i, weight: String(item.weightKg), value: String(item.value) })),
  );
  const [reward, setReward] = useDraft('package.reward', () => String(start.reward));
  const [nextKey, setNextKey] = useDraft('package.nextKey', () => start.items.length);
  const [step, setStep] = useDraft('package.step', () => 0);
  const top = useRef<HTMLDivElement>(null);

  // Each step starts at the top, like a new screen
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    top.current?.closest('main')?.scrollTo(0, 0);
  }, [step]);

  if (story === null) return null;

  const draft: PackageDraft = {
    ...start,
    items: items.map(({ id, name, category, description, photo, weight, value }) => ({
      id,
      name,
      category,
      description,
      photo,
      weightKg: toNumber(weight),
      value: toNumber(value),
    })),
    reward: toNumber(reward),
  };
  const errors = validatePackage(draft);
  const stepErrors = [
    errors.filter((e) => !PREFERENCE_ERRORS.has(e)),
    errors.filter((e) => PREFERENCE_ERRORS.has(e)),
    errors,
  ][step];
  const weight = items.every((i) => weightOk(i.weight)) ? totalWeight(draft) : null;

  const update = (key: number, patch: Partial<ItemForm>) =>
    setItems((list) => list.map((i) => (i.key === key ? { ...i, ...patch } : i)));

  const next = () => {
    if (stepErrors.length === 0) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) return next();
    if (errors.length === 0) dispatch({ type: 'postPackage', pkg: draft });
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-1 flex-col gap-5 p-6">
      <div ref={top} className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-brand">Send an Item</h1>
        <p className="text-slate-600">Tell travelers what you&apos;re sending and what you&apos;ll pay.</p>
      </div>

      <Stepper steps={STEPS} current={step} />

      {step === 0 && (
        <>
          {items.map((item, i) => (
            <fieldset
              key={item.key}
              aria-label={`Item ${i + 1}`}
              className="flex flex-col gap-3 rounded-[20px] bg-white p-4 shadow-[0_1px_3px_rgb(11_31_75/0.08),0_4px_16px_rgb(11_31_75/0.06)]"
            >
              <div className="flex min-h-11 items-center justify-between">
                <p aria-hidden className="font-semibold text-brand">
                  Item {i + 1}
                </p>
                {items.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remove item ${i + 1}`}
                    onClick={() => {
                      photos.removeItem(item.id);
                      setItems((list) => list.filter((x) => x.key !== item.key));
                    }}
                    className="grid size-11 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"
                  >
                    <Trash2 aria-hidden className="size-5" />
                  </button>
                )}
              </div>
              <ItemPhotos item={item} />
              <Field
                label="Item name"
                value={item.name}
                onChange={(e) => update(item.key, { name: e.target.value })}
                error={item.name.trim() === '' ? 'Name each item' : null}
              />
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`category-${item.key}`} className="text-sm font-medium text-slate-700">
                  Category
                </label>
                <select
                  id={`category-${item.key}`}
                  value={item.category}
                  onChange={(e) => update(item.key, { category: e.target.value as ItemCategory })}
                  className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-base"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Weight (kg)"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min={MIN_ITEM_KG}
                  max={MAX_ITEM_KG}
                  value={item.weight}
                  onChange={(e) => update(item.key, { weight: e.target.value })}
                  error={weightOk(item.weight) ? null : `Enter a weight between ${MIN_ITEM_KG} and ${MAX_ITEM_KG} kg`}
                />
                <Field
                  label={`Item value (${story.currency})`}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={item.value}
                  onChange={(e) => update(item.key, { value: e.target.value })}
                  error={valueOk(item.value) ? null : 'Enter a value of 0 or more'}
                />
              </div>
              <Field
                label="Description (optional)"
                value={item.description}
                onChange={(e) => update(item.key, { description: e.target.value })}
              />
            </fieldset>
          ))}

          {items.length < MAX_ITEMS && (
            <Button
              variant="secondary"
              onClick={() => {
                setItems((list) => [
                  ...list,
                  {
                    key: nextKey,
                    id: `item-${nextKey + 1}`,
                    name: '',
                    category: 'Package',
                    description: '',
                    weight: '',
                    value: '0',
                    photo: '/items/generic.svg',
                  },
                ]);
                setNextKey((k) => k + 1);
              }}
            >
              <Plus aria-hidden className="size-5" />
              Add another item
            </Button>
          )}

          <p className={cx('font-semibold text-brand', weight === null && 'text-slate-500')}>
            {weight === null ? 'Total weight: –' : `Total weight: ${weight} kg`}
          </p>
        </>
      )}

      {step >= 1 && (
        <Card className="flex flex-col gap-2">
          <p className="flex items-center gap-2 font-semibold text-brand">
            <MapPin aria-hidden className="size-5 text-sky" />
            {start.origin} → {start.destination}
          </p>
          <p className="flex items-center gap-2 text-slate-600">
            <CalendarDays aria-hidden className="size-5 text-sky" />
            {formatRange(start.preferredDeparture, start.preferredArrival)}
          </p>
        </Card>
      )}

      {step === 1 && (
        <Field
          label={`Reward (${story.currency})`}
          type="number"
          inputMode="decimal"
          min={1}
          value={reward}
          onChange={(e) => setReward(e.target.value)}
          error={toNumber(reward) > 0 ? null : 'Enter a reward'}
        />
      )}

      {step === 2 && (
        <>
          <Card className="flex flex-col gap-3">
            <h2 className="font-bold text-brand">Your items · {weight ?? '–'} kg</h2>
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.key} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local files and object URLs */}
                  <img src={item.photo} alt="" className="size-12 rounded-xl bg-brand-soft object-cover" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="font-semibold break-words text-brand">{item.name}</span>
                    <span className="text-sm text-slate-600">
                      {item.category} · {item.weight} kg · value {formatMoney(toNumber(item.value) || 0, story.currency)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          {draft.reward > 0 && <PaymentTable fees={computeFees(draft.reward, story.currency)} currency={story.currency} />}
        </>
      )}

      {/* Keyed by step: the buttons re-arm, so a double tap on Next can't skip a step */}
      <div key={step} className="mt-auto flex gap-3">
        {step > 0 && (
          <Button variant="secondary" onClick={() => setStep((s) => Math.max(s - 1, 0))}>
            Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button type="submit">Next</Button>
        ) : (
          <Button type="submit" disabled={errors.length > 0}>
            Find travelers
          </Button>
        )}
      </div>
    </form>
  );
}
