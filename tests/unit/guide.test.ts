import { describe, expect, it } from 'vitest';
import { guideFor } from '@/demo/guide';
import { demoReducer, initialState, STEPS } from '@/demo/reducer';
import { DIASPORA, DOMESTIC } from '@/demo/stories';
import type { DemoState, Step } from '@/demo/types';

const at = (step: Step, extra: Partial<DemoState> = {}): DemoState => ({
  ...initialState,
  storyId: 'diaspora',
  step,
  ...extra,
});

describe('guideFor', () => {
  it('has no one to act at the start', () => {
    const g = guideFor(initialState, null);
    expect(g.who).toBeNull();
    expect(g.next).toBe('Tap Get Started, then pick a story.');
  });

  it('tells the sender to switch to the traveler once the offer is sent', () => {
    const g = guideFor(at('offerSent', { view: 'sender', chosenTravelerId: 'dawit' }), DIASPORA);
    expect(g.who).toBe('traveler');
    expect(g.next).toContain('Switch to Dawit');
  });

  it("doesn't say switch when the right side is already shown", () => {
    const g = guideFor(at('offerSent', { view: 'traveler', chosenTravelerId: 'dawit' }), DIASPORA);
    expect(g.next).not.toContain('Switch');
    expect(g.next).toMatch(/Accept/);
  });

  it('uses each story’s names', () => {
    const g = guideFor(at('matches', { storyId: 'domestic' }), DOMESTIC);
    expect(g.next).toContain('Abebe');
  });

  it('during rating, points at whoever has not rated yet', () => {
    const senderRated = at('rating', { view: 'sender', ratings: { sender: { stars: 5 }, traveler: null } });
    expect(guideFor(senderRated, DIASPORA).who).toBe('traveler');
    const bothRated = at('rating', { ratings: { sender: { stars: 5 }, traveler: { stars: 4 } } });
    // Names the button exactly as it reads
    expect(guideFor(bothRated, DIASPORA).next).toBe('Tap See summary.');
  });

  it('has a title and a next step for every step', () => {
    for (const step of STEPS) {
      const g = guideFor(step === 'start' ? initialState : at(step), step === 'start' ? null : DIASPORA);
      expect(g.title, step).not.toBe('');
      expect(g.next, step).not.toBe('');
    }
  });

  it('says to edit the package when no traveler has room', () => {
    const heavy = {
      ...DIASPORA.packageDraft,
      items: [{ ...DIASPORA.packageDraft.items[0], weightKg: 9 }],
    };
    const g = guideFor(at('matches', { pkg: heavy }), DIASPORA);
    expect(g.next).toBe('Tap Edit package and make it lighter.');
    expect(g.body).toMatch(/No traveler on this route has room/);

    const fits = guideFor(at('matches', { pkg: DIASPORA.packageDraft }), DIASPORA);
    expect(fits.next).toBe('Send an offer to Dawit.');
  });

  it('says the Fayda step is simulated', () => {
    expect(guideFor(at('verify'), DIASPORA).body).toMatch(/simulated/);
  });

  it('a fresh story starts at sign-up with the sender acting', () => {
    const s = demoReducer(initialState, { type: 'chooseStory', story: 'diaspora' });
    expect(guideFor(s, DIASPORA).who).toBe('sender');
  });

  it('at home, the sender is told to tap Send an Item', () => {
    const g = guideFor(at('home'), DIASPORA);
    expect(g.who).toBe('sender');
    expect(g.title).toBe('Home');
    expect(g.next).toBe('Tap Send an Item.');
  });

  it("at home on the traveler's phone, says to switch first", () => {
    expect(guideFor(at('home', { view: 'traveler' }), DIASPORA).next).toBe('Switch to Selam, then tap Send an Item.');
  });

  it('with a tab panel open, says to tap Home', () => {
    for (const panel of ['search', 'trips', 'profile'] as const) {
      expect(guideFor(at('paid', { panel }), DIASPORA).next).toBe('Tap Home to continue.');
    }
  });

  it('on the form, walks through the three steps', () => {
    expect(guideFor(at('post'), DIASPORA).next).toBe('Check the item, tap Next twice, then Find travelers.');
  });
});
