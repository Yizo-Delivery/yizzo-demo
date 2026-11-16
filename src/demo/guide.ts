import type { DemoState, Step, Story, View } from './types';

export interface Guide {
  /** Whose turn it is; null when no one in particular */
  who: View | null;
  title: string;
  body: string;
  /** One short instruction: what to tap next */
  next: string;
}

const first = (name: string) => name.split(' ')[0];

interface Names {
  sender: string;
  traveler: string;
}

type Entry = (names: Names, state: DemoState) => Omit<Guide, 'next'> & { action: string };

const ENTRIES: Record<Exclude<Step, 'start'>, Entry> = {
  signup: ({ sender }) => ({
    who: 'sender',
    title: 'Sign up',
    body: `${sender} creates an account. New accounts can't send or carry anything until they're verified.`,
    action: 'Tap Create account.',
  }),
  verify: () => ({
    who: 'sender',
    title: 'Verify identity',
    body: "Yizzo checks every user against Fayda, Ethiopia's national ID, so each person has one account. This screen simulates that sign-in.",
    action: 'Tap Verify with Fayda, allow, then Continue.',
  }),
  phone: () => ({
    who: 'sender',
    title: 'Confirm the phone',
    body: 'A code goes to the phone number on the national ID. Once it is confirmed, the account is active.',
    action: 'Fill in the code, tap Confirm, then Continue.',
  }),
  post: ({ sender }) => ({
    who: 'sender',
    title: 'Post a package',
    body: `${sender} lists what she's sending, where it goes, and the reward she'll pay the traveler. Try changing a weight.`,
    action: 'Tap Find travelers.',
  }),
  matches: ({ traveler }) => ({
    who: 'sender',
    title: 'Matches',
    body: 'Yizzo ranks travelers on the same route by date, rating and spare room. Everyone shown has a verified identity.',
    action: `Send an offer to ${traveler}.`,
  }),
  offerSent: () => ({
    who: 'traveler',
    title: 'Offer sent',
    body: 'Now the other side of the marketplace: the traveler gets the offer and decides.',
    action: 'Tap Accept.',
  }),
  offerAccepted: ({ traveler }) => ({
    who: 'sender',
    title: 'Offer accepted',
    body: `${traveler} said yes. Confirming locks the package to this trip, so no one else can take it.`,
    action: `Confirm ${traveler}.`,
  }),
  confirmed: () => ({
    who: 'sender',
    title: 'Pay into escrow',
    body: "The money goes to Yizzo, not the traveler. It's held until the sender confirms delivery.",
    action: 'Tap Pay into escrow.',
  }),
  paid: () => ({
    who: 'traveler',
    title: 'Money held',
    body: 'The traveler knows the payment is safe before picking up. Both can message each other in the app.',
    action: 'Mark the package picked up.',
  }),
  pickedUp: () => ({
    who: 'traveler',
    title: 'Picked up',
    body: 'The sender follows each step of the trip.',
    action: 'Mark it in transit.',
  }),
  inTransit: () => ({
    who: 'traveler',
    title: 'In transit',
    body: 'The package is on its way.',
    action: 'Mark it delivered.',
  }),
  delivered: () => ({
    who: 'sender',
    title: 'Delivered',
    body: 'Only the sender can release the money, by confirming the package arrived.',
    action: 'Tap Confirm delivery.',
  }),
  released: ({ traveler }) => ({
    who: 'sender',
    title: 'Money released',
    body: `${traveler} gets the full reward and Yizzo keeps its fee. That fee is how Yizzo earns.`,
    action: `Rate ${traveler}.`,
  }),
  rating: ({ sender, traveler }, state) => {
    const { ratings } = state;
    const both = ratings.sender !== null && ratings.traveler !== null;
    const who: View = both ? state.view : ratings.sender === null ? 'sender' : 'traveler';
    return {
      who,
      title: 'Ratings',
      body: 'Ratings stay hidden until both have rated, so neither side can retaliate.',
      action: both ? 'Tap See the summary.' : `Rate ${who === 'sender' ? traveler : sender}.`,
    };
  },
  done: () => ({
    who: null,
    title: "That's one delivery",
    body: 'Verified people, matched by route, paid through escrow, rated both ways.',
    action: 'Try the other story, or start over.',
  }),
};

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export function guideFor(state: DemoState, story: Story | null): Guide {
  if (story === null || state.step === 'start') {
    return {
      who: null,
      title: 'Welcome to the Yizzo demo',
      body: 'Yizzo connects people sending packages with travelers already going that way. Every person and number here is sample data.',
      next: 'Pick a story to begin.',
    };
  }

  const traveler = story.travelers.find((t) => t.id === state.chosenTravelerId) ?? story.travelers[0];
  const names: Names = { sender: first(story.sender.name), traveler: first(traveler.name) };
  const { action, ...entry } = ENTRIES[state.step](names, state);

  const next =
    entry.who !== null && entry.who !== state.view
      ? `Switch to ${entry.who === 'sender' ? names.sender : names.traveler}, then ${lowerFirst(action)}`
      : action;
  return { ...entry, next };
}
