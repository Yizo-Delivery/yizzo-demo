'use client';

import { CalendarDays, MapPin, Plus, Trash2 } from 'lucide-react';
import { type FormEvent } from 'react';
import { Button, Card, Field, cx } from '@/components/ui';
import { formatRange } from '@/demo/dates';
import { useDemo, useDraft } from '@/demo/DemoProvider';
import { MAX_ITEM_KG, MAX_ITEMS, MIN_ITEM_KG, totalWeight, validatePackage } from '@/demo/matching';
import type { Item, ItemCategory, PackageDraft } from '@/demo/types';

const CATEGORIES: ItemCategory[] = ['Documents', 'Package', 'Clothing', 'Fragile', 'Food', 'Electronics', 'Other'];

/** What the inputs hold: numbers as typed, so a half-typed "0." isn't lost */
interface ItemForm extends Omit<Item, 'weightKg'> {
  key: number;
  weight: string;
}

const toNumber = (s: string) => (s.trim() === '' ? NaN : Number(s));
const weightOk = (s: string) => {
  const n = toNumber(s);
  return n >= MIN_ITEM_KG && n <= MAX_ITEM_KG;
};

export function PostPackageScreen() {
  const { state, story, dispatch } = useDemo();
  const start = state.pkg ?? story!.packageDraft;
  // Drafts, not plain state: edits survive switching to the traveler's phone and back
  const [items, setItems] = useDraft<ItemForm[]>('package.items', () =>
    start.items.map((item, i) => ({ ...item, key: i, weight: String(item.weightKg) })),
  );
  const [reward, setReward] = useDraft('package.reward', () => String(start.reward));
  const [nextKey, setNextKey] = useDraft('package.nextKey', () => start.items.length);
  if (story === null) return null;

  const draft: PackageDraft = {
    ...start,
    items: items.map(({ id, name, category, description, value, photo, weight }) => ({
      id,
      name,
      category,
      description,
      value,
      photo,
      weightKg: toNumber(weight),
    })),
    reward: toNumber(reward),
  };
  const errors = validatePackage(draft);
  const weight = items.every((i) => weightOk(i.weight)) ? totalWeight(draft) : null;

  const update = (key: number, patch: Partial<ItemForm>) =>
    setItems((list) => list.map((i) => (i.key === key ? { ...i, ...patch } : i)));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (errors.length === 0) dispatch({ type: 'postPackage', pkg: draft });
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Send a package</h1>
        <p className="text-slate-600">Tell travelers what you&apos;re sending and what you&apos;ll pay.</p>
      </div>

      <Card className="flex flex-col gap-2">
        <p className="flex items-center gap-2 font-semibold">
          <MapPin aria-hidden className="size-5 text-brand" />
          {start.origin} → {start.destination}
        </p>
        <p className="flex items-center gap-2 text-slate-600">
          <CalendarDays aria-hidden className="size-5 text-brand" />
          {formatRange(start.preferredDeparture, start.preferredArrival)}
        </p>
      </Card>

      {items.map((item, i) => (
        <fieldset
          key={item.key}
          aria-label={`Item ${i + 1}`}
          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div className="flex min-h-11 items-center justify-between">
            <p aria-hidden className="font-semibold">
              Item {i + 1}
            </p>
            {items.length > 1 && (
              <button
                type="button"
                aria-label={`Remove item ${i + 1}`}
                onClick={() => setItems((list) => list.filter((x) => x.key !== item.key))}
                className="grid size-11 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <Trash2 aria-hidden className="size-5" />
              </button>
            )}
          </div>
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
          <Field
            label="Item name"
            value={item.name}
            onChange={(e) => update(item.key, { name: e.target.value })}
            error={item.name.trim() === '' ? 'Name each item' : null}
          />
          <Field
            label="Description (optional)"
            value={item.description}
            onChange={(e) => update(item.key, { description: e.target.value })}
          />
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
        </fieldset>
      ))}

      {items.length < MAX_ITEMS && (
        <Button
          variant="secondary"
          onClick={() => {
            setItems((list) => [...list, {
                key: nextKey,
                id: `item-${nextKey + 1}`,
                name: '',
                category: 'Package',
                description: '',
                weight: '',
                value: 0,
                photo: '/items/generic.svg',
              }]);
            setNextKey((k) => k + 1);
          }}
        >
          <Plus aria-hidden className="size-5" />
          Add item
        </Button>
      )}

      <p className={cx('font-semibold', weight === null && 'text-slate-500')}>
        {weight === null ? 'Total weight: –' : `Total weight: ${weight} kg`}
      </p>

      <Field
        label={`Reward (${story.currency})`}
        type="number"
        inputMode="decimal"
        min={1}
        value={reward}
        onChange={(e) => setReward(e.target.value)}
        error={toNumber(reward) > 0 ? null : 'Enter a reward'}
      />

      <Button type="submit" disabled={errors.length > 0} className="mt-auto">
        Find travelers
      </Button>
    </form>
  );
}
