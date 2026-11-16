import { describe, expect, it } from 'vitest';
import { matchTravelers, totalWeight, validatePackage } from '@/demo/matching';
import { DIASPORA, DOMESTIC } from '@/demo/stories';
import type { PackageDraft } from '@/demo/types';

const withWeights = (pkg: PackageDraft, ...weights: number[]): PackageDraft => ({
  ...pkg,
  items: pkg.items.map((item, i) => ({ ...item, weightKg: weights[i] ?? item.weightKg })),
});

describe('matchTravelers', () => {
  it('ranks by date, then rating, then spare room', () => {
    expect(matchTravelers(DIASPORA, DIASPORA.packageDraft).map((t) => t.name)).toEqual([
      'Dawit Bekele',
      'Hirut Alemu',
      'Yonas Girma',
    ]);
    expect(matchTravelers(DOMESTIC, DOMESTIC.packageDraft)[0].name).toBe('Abebe Tadesse');
  });

  it('drops travelers without room', () => {
    const fourKg = withWeights(DIASPORA.packageDraft, 3.2, 0.8);
    expect(matchTravelers(DIASPORA, fourKg).map((t) => t.name)).toEqual([
      'Dawit Bekele',
      'Hirut Alemu',
    ]);
    expect(matchTravelers(DIASPORA, withWeights(DIASPORA.packageDraft, 30, 0.8))).toEqual([]);
  });
});

describe('totalWeight', () => {
  it('sums the items without floating-point noise', () => {
    expect(totalWeight(DIASPORA.packageDraft)).toBe(3);
    expect(totalWeight(withWeights(DIASPORA.packageDraft, 30, 0.8))).toBe(30.8);
  });
});

describe('validatePackage', () => {
  it('accepts the prefilled packages', () => {
    expect(validatePackage(DIASPORA.packageDraft)).toEqual([]);
    expect(validatePackage(DOMESTIC.packageDraft)).toEqual([]);
  });

  it('rejects a zero or too-heavy weight, an empty description and a reward of 0', () => {
    const bad: PackageDraft = {
      ...DIASPORA.packageDraft,
      reward: 0,
      items: [
        { category: 'Electronics', description: 'Laptop', weightKg: 0 },
        { category: 'Other', description: '  ', weightKg: 31 },
      ],
    };
    expect(validatePackage(bad)).toEqual([
      'Enter a weight between 0.1 and 30 kg',
      'Describe each item',
      'Enter a reward',
    ]);
  });

  it('needs one to three items', () => {
    expect(validatePackage({ ...DIASPORA.packageDraft, items: [] })).toContain('Add at least one item');
    const item = DIASPORA.packageDraft.items[0];
    expect(validatePackage({ ...DIASPORA.packageDraft, items: [item, item, item, item] })).toContain(
      'Add up to 3 items',
    );
  });
});
