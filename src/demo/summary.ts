import { computeFees, formatMoney } from './fees';
import type { DemoState, Story } from './types';

const first = (name: string) => name.split(' ')[0];

/** The done screen's recap of what just happened */
export function summaryLines(state: DemoState, story: Story): string[] {
  if (state.pkg === null) return [];
  const traveler = story.travelers.find((t) => t.id === state.chosenTravelerId) ?? story.travelers[0];
  const best = traveler.id === story.travelers[0].id;
  const fees = state.fees ?? computeFees(state.pkg.reward, story.currency);
  const money = (n: number) => formatMoney(n, story.currency);
  const sender = first(story.sender.name);
  const carrier = first(traveler.name);

  return [
    `${sender} verified her identity with Fayda (simulated here) and her phone.`,
    `Yizzo matched her package with ${carrier}, ${best ? 'the best traveler' : 'a verified traveler'} on the route.`,
    `She paid ${money(fees.total)} into escrow.`,
    `${carrier} delivered it and received ${money(fees.reward)}; Yizzo kept ${money(fees.fee)}.`,
    'They rated each other.',
  ];
}
