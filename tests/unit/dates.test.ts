import { describe, expect, it } from 'vitest';
import { formatDay, formatRange } from '@/demo/dates';

describe('dates', () => {
  it('formats a day the same in every time zone', () => {
    expect(formatDay('2026-12-04')).toBe('Dec 4');
  });

  it('shows one day when a trip starts and ends the same day', () => {
    expect(formatRange('2026-12-04', '2026-12-05')).toBe('Dec 4 – Dec 5');
    expect(formatRange('2026-12-06', '2026-12-06')).toBe('Dec 6');
  });
});
