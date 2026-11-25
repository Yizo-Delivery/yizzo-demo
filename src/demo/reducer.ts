import { computeFees } from './fees';
import { matchTravelers, validatePackage } from './matching';
import { getStory, tripsFor } from './stories';
import type { DemoAction, DemoState, Message, Step, Story, View } from './types';

export const STEPS: readonly Step[] = [
  'start',
  'signup',
  'verify',
  'phone',
  'post',
  'matches',
  'offerSent',
  'offerAccepted',
  'confirmed',
  'paid',
  'pickedUp',
  'inTransit',
  'delivered',
  'released',
  'rating',
  'done',
];

export const stepIndex = (step: Step) => STEPS.indexOf(step);

/** True once the demo has reached `step` (or gone past it) */
export const reached = (state: DemoState, step: Step) => stepIndex(state.step) >= stepIndex(step);

export const MAX_MESSAGE_LENGTH = 2000;

export const initialState: DemoState = {
  storyId: null,
  step: 'start',
  view: 'sender',
  panel: null,
  account: null,
  identityVerified: false,
  phoneVerified: false,
  codeError: false,
  pkg: null,
  chosenTravelerId: null,
  fees: null,
  messages: [],
  replied: false,
  trips: [],
  ratings: { sender: null, traveler: null },
};

const DELIVERY_NEXT: Partial<Record<Step, Step>> = {
  paid: 'pickedUp',
  pickedUp: 'inTransit',
  inTransit: 'delivered',
};

const message = (state: DemoState, from: View, text: string, at: string, offset = 0): Message => ({
  id: `msg-${state.messages.length + 1 + offset}`,
  from,
  text,
  at,
});

/**
 * The whole demo as one pure function. An action that doesn't fit the
 * current step, view or panel returns the same state object, so a double
 * tap or a tap from the wrong side does nothing.
 */
export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  if (action.type === 'restart') return initialState;

  if (action.type === 'chooseStory') {
    if (state.step !== 'start') return state;
    const story = getStory(action.story);
    return { ...state, storyId: story.id, step: 'signup', trips: [...story.travelerTrips] };
  }

  if (state.storyId === null) return state;
  return storyReducer(state, action, getStory(state.storyId));
}

function storyReducer(state: DemoState, action: DemoAction, story: Story): DemoState {
  const at = (step: Step, view?: View) => state.step === step && (view === undefined || state.view === view);

  switch (action.type) {
    case 'signUp': {
      const name = action.name.trim();
      const email = action.email.trim();
      if (!at('signup', 'sender') || !name || !email) return state;
      return { ...state, account: { name, email }, step: 'verify' };
    }

    case 'verifyIdentity':
      if (!at('verify', 'sender')) return state;
      return { ...state, identityVerified: true, step: 'phone' };

    case 'confirmPhone':
      if (!at('phone', 'sender')) return state;
      if (action.code.trim() !== story.phoneCode) return { ...state, codeError: true };
      return { ...state, phoneVerified: true, codeError: false, step: 'post' };

    case 'postPackage':
      if (!at('post', 'sender') || validatePackage(action.pkg).length > 0) return state;
      return { ...state, pkg: action.pkg, step: 'matches' };

    case 'editPackage':
      if (!at('matches', 'sender')) return state;
      return { ...state, step: 'post' };

    case 'sendOffer': {
      if (!at('matches', 'sender') || state.pkg === null) return state;
      const fits = matchTravelers(story, state.pkg).some((t) => t.id === action.travelerId);
      if (!fits) return state;
      // The traveler view becomes this traveler's phone: the best match keeps
      // the trips shown so far (including any posted); anyone else shows their own
      const best = action.travelerId === story.travelers[0].id;
      return {
        ...state,
        chosenTravelerId: action.travelerId,
        step: 'offerSent',
        trips: best ? state.trips : tripsFor(story, action.travelerId),
      };
    }

    case 'switchView':
      if (!reached(state, 'post') || state.view === action.view) return state;
      return { ...state, view: action.view, panel: null };

    case 'acceptOffer':
      if (!at('offerSent', 'traveler')) return state;
      return { ...state, step: 'offerAccepted' };

    case 'confirmTraveler':
      if (!at('offerAccepted', 'sender')) return state;
      return { ...state, step: 'confirmed' };

    case 'payEscrow':
      if (!at('confirmed', 'sender') || state.pkg === null) return state;
      return { ...state, fees: computeFees(state.pkg.reward, story.currency), step: 'paid' };

    case 'openPanel':
      if (state.panel === action.panel) return state;
      if (action.panel === 'chat') {
        if (!reached(state, 'offerSent')) return state;
        const messages = state.messages.length === 0 ? [...story.seededMessages] : state.messages;
        return { ...state, panel: 'chat', messages };
      }
      if (!reached(state, 'post') || state.view !== 'traveler') return state;
      return { ...state, panel: 'postTrip' };

    case 'closePanel':
      if (state.panel === null) return state;
      return { ...state, panel: null };

    case 'sendMessage': {
      const text = action.text.trim();
      if (state.panel !== 'chat' || text.length === 0 || text.length > MAX_MESSAGE_LENGTH) return state;
      const sent = message(state, state.view, text, action.at);
      if (state.view === 'sender' && !state.replied) {
        const reply = message(state, 'traveler', story.cannedReply, action.at, 1);
        return { ...state, messages: [...state.messages, sent, reply], replied: true };
      }
      return { ...state, messages: [...state.messages, sent] };
    }

    case 'advanceDelivery': {
      const next = DELIVERY_NEXT[state.step];
      if (next === undefined || state.view !== 'traveler' || action.from !== state.step) return state;
      return { ...state, step: next };
    }

    case 'confirmDelivery':
      if (!at('delivered', 'sender')) return state;
      return { ...state, step: 'released' };

    case 'rate':
      if ((!at('released') && !at('rating')) || state.ratings[state.view] !== null) return state;
      return { ...state, ratings: { ...state.ratings, [state.view]: action.rating }, step: 'rating' };

    case 'finish':
      if (!at('rating') || state.ratings.sender === null || state.ratings.traveler === null) return state;
      return { ...state, step: 'done', panel: null };

    case 'postTrip':
      if (state.panel !== 'postTrip' || state.view !== 'traveler') return state;
      return { ...state, trips: [...state.trips, action.trip], panel: null };

    default:
      return state;
  }
}
