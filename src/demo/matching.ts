import type { PackageDraft, Story, Traveler } from './types';

export const MAX_ITEMS = 3;
export const MAX_ITEM_KG = 30;
export const MIN_ITEM_KG = 0.1;

/** Total weight, rounded to 0.1 kg so 2.2 + 0.8 is 3, not 3.0000000000000004 */
export function totalWeight(pkg: PackageDraft): number {
  return Math.round(pkg.items.reduce((sum, item) => sum + item.weightKg, 0) * 10) / 10;
}

/** What's wrong with the package, one message per kind of problem; empty when it's fine */
export function validatePackage(pkg: PackageDraft): string[] {
  const errors: string[] = [];
  if (pkg.items.length === 0) errors.push('Add at least one item');
  if (pkg.items.length > MAX_ITEMS) errors.push(`Add up to ${MAX_ITEMS} items`);
  if (pkg.items.some((i) => !(i.weightKg >= MIN_ITEM_KG && i.weightKg <= MAX_ITEM_KG))) {
    errors.push(`Enter a weight between ${MIN_ITEM_KG} and ${MAX_ITEM_KG} kg`);
  }
  if (pkg.items.some((i) => i.name.trim() === '')) errors.push('Name each item');
  if (pkg.items.some((i) => !(i.value >= 0))) errors.push('Enter a value of 0 or more');
  if (!(pkg.reward > 0)) errors.push('Enter a reward');
  return errors;
}

/**
 * Travelers with room for the package, ranked the way the backend ranks
 * them once the route matches: closest date, then rating, then spare room
 */
export function matchTravelers(story: Story, pkg: PackageDraft): Traveler[] {
  const weight = totalWeight(pkg);
  return story.travelers
    .filter((t) => t.spareKg >= weight)
    .sort((a, b) => a.dateDiffDays - b.dateDiffDays || b.rating - a.rating || b.spareKg - a.spareKg);
}

/** A fresh item id, one past the highest in use, so a removed item's id is never reused */
export function nextItemId(ids: readonly string[]): string {
  const highest = Math.max(0, ...ids.map((id) => Number(id.replace(/^item-/, '')) || 0));
  return `item-${highest + 1}`;
}
