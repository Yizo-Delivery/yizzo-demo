import { describe, expect, it } from 'vitest';
import { computeFees, formatMoney } from '@/demo/fees';

describe('computeFees', () => {
  it('adds a 10% fee and 8% tax on reward plus fee, in cents for dollars', () => {
    expect(computeFees(60, 'USD')).toEqual({ reward: 60, fee: 6, tax: 5.28, total: 71.28 });
  });

  it('rounds each part to whole birr', () => {
    expect(computeFees(600, 'ETB')).toEqual({ reward: 600, fee: 60, tax: 53, total: 713 });
  });

  it('keeps the total equal to the sum of the rounded parts', () => {
    const f = computeFees(33.33, 'USD');
    expect(f.total).toBe(Math.round((f.reward + f.fee + f.tax) * 100) / 100);
  });
});

describe('formatMoney', () => {
  it('formats dollars with cents', () => {
    expect(formatMoney(71.28, 'USD')).toBe('$71.28');
    expect(formatMoney(60, 'USD')).toBe('$60.00');
  });

  it('formats birr as whole numbers', () => {
    expect(formatMoney(713, 'ETB')).toBe('713 ETB');
    expect(formatMoney(1250, 'ETB')).toBe('1,250 ETB');
  });
});
