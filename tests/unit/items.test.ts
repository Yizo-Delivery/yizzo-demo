import { describe, expect, it } from 'vitest';
import { nextItemId } from '@/demo/matching';

describe('nextItemId', () => {
  it('is one past the highest existing number', () => {
    expect(nextItemId(['item-1', 'item-2'])).toBe('item-3');
  });

  it("doesn't reuse an id after an earlier item was removed", () => {
    expect(nextItemId(['item-2'])).toBe('item-3');
  });

  it('starts at item-1 for no items', () => {
    expect(nextItemId([])).toBe('item-1');
  });
});
