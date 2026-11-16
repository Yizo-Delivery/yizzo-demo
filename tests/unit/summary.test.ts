import { describe, expect, it } from 'vitest';
import { initialState } from '@/demo/reducer';
import { DIASPORA } from '@/demo/stories';
import { summaryLines } from '@/demo/summary';
import type { DemoState } from '@/demo/types';

const done = (travelerId: string): DemoState => ({
  ...initialState,
  storyId: 'diaspora',
  step: 'done',
  pkg: DIASPORA.packageDraft,
  chosenTravelerId: travelerId,
  fees: { reward: 60, fee: 6, tax: 5.28, total: 71.28 },
});

describe('summaryLines', () => {
  it('calls the best match the best traveler', () => {
    const lines = summaryLines(done('dawit'), DIASPORA);
    expect(lines).toContain('Yizzo matched her package with Dawit, the best traveler on the route.');
    expect(lines).toContain('She paid $71.28 into escrow.');
    expect(lines).toContain('Dawit delivered it and received $60.00; Yizzo kept $6.00.');
  });

  it("doesn't call another traveler the best", () => {
    const lines = summaryLines(done('hirut'), DIASPORA);
    expect(lines).toContain('Yizzo matched her package with Hirut, a verified traveler on the route.');
    expect(lines.join(' ')).not.toContain('best');
    expect(lines).toContain('Hirut delivered it and received $60.00; Yizzo kept $6.00.');
  });
});
