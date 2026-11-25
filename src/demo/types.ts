export type StoryId = 'diaspora' | 'domestic';
export type Currency = 'USD' | 'ETB';
export type View = 'sender' | 'traveler';
export type ItemCategory =
  | 'Documents'
  | 'Package'
  | 'Clothing'
  | 'Fragile'
  | 'Food'
  | 'Electronics'
  | 'Other';
export type Step =
  | 'start'
  | 'signup'
  | 'verify'
  | 'phone'
  | 'post'
  | 'matches'
  | 'offerSent'
  | 'offerAccepted'
  | 'confirmed'
  | 'paid'
  | 'pickedUp'
  | 'inTransit'
  | 'delivered'
  | 'released'
  | 'rating'
  | 'done';
export type Panel = null | 'chat' | 'postTrip';

export interface Person {
  id: string;
  name: string;
  city: string;
}
export interface Traveler extends Person {
  rating: number;
  trips: number;
  spareKg: number;
  departure: string; // ISO dates
  arrival: string;
  dateDiffDays: number; // distance from the package's preferred date
}
export interface Item {
  category: ItemCategory;
  description: string;
  weightKg: number;
}
export interface PackageDraft {
  items: Item[];
  origin: string;
  destination: string;
  preferredDeparture: string;
  preferredArrival: string;
  reward: number;
}
export interface Trip {
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  capacityKg: number;
}
export interface Message {
  id: string;
  from: View;
  text: string;
  at: string;
}
export interface Fees {
  reward: number;
  fee: number;
  tax: number;
  total: number;
}
export interface Rating {
  stars: 1 | 2 | 3 | 4 | 5;
  review?: string;
}

export interface Story {
  id: StoryId;
  title: string;
  subtitle: string;
  currency: Currency;
  sender: Person & { email: string; phoneMasked: string };
  phoneCode: string; // '482913' in both stories
  packageDraft: PackageDraft; // the prefilled package
  travelers: Traveler[]; // 3; travelers[0] is the best match
  travelerTrips: Trip[]; // the best match's existing trips
  seededMessages: Message[]; // 2–3, shown when chat first opens
  cannedReply: string; // the traveler's one reply to the sender's first message
}

export interface DemoState {
  storyId: StoryId | null;
  step: Step;
  view: View;
  panel: Panel;
  account: { name: string; email: string } | null;
  identityVerified: boolean;
  phoneVerified: boolean;
  codeError: boolean;
  pkg: PackageDraft | null;
  chosenTravelerId: string | null;
  fees: Fees | null;
  messages: Message[];
  replied: boolean;
  trips: Trip[];
  ratings: { sender: Rating | null; traveler: Rating | null };
}

export type DemoAction =
  | { type: 'chooseStory'; story: StoryId }
  | { type: 'signUp'; name: string; email: string }
  | { type: 'verifyIdentity' }
  | { type: 'confirmPhone'; code: string }
  | { type: 'postPackage'; pkg: PackageDraft }
  | { type: 'editPackage' } // matches → post
  | { type: 'sendOffer'; travelerId: string }
  | { type: 'switchView'; view: View }
  | { type: 'acceptOffer' }
  | { type: 'confirmTraveler' }
  | { type: 'payEscrow' }
  | { type: 'openPanel'; panel: Exclude<Panel, null> }
  | { type: 'closePanel' }
  | { type: 'sendMessage'; text: string; /** ISO time, stamped by the screen so the reducer stays pure */ at: string }
  // paid → pickedUp → inTransit → delivered; `from` is the step the tap was
  // made on, so a second tap of the same button is ignored
  | { type: 'advanceDelivery'; from: Step }
  | { type: 'confirmDelivery' }
  | { type: 'rate'; rating: Rating }
  | { type: 'postTrip'; trip: Trip }
  | { type: 'finish' } // rating → done, once both have rated
  | { type: 'restart' }; // back to initialState
