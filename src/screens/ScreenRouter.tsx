'use client';

import { useDemo } from '@/demo/DemoProvider';
import { reached } from '@/demo/reducer';
import { ChatScreen } from './ChatScreen';
import { DeliveryScreen } from './DeliveryScreen';
import { DoneScreen } from './DoneScreen';
import { EscrowScreen } from './EscrowScreen';
import { MatchesScreen } from './MatchesScreen';
import { PhoneScreen } from './PhoneScreen';
import { PostPackageScreen } from './PostPackageScreen';
import { PostTripScreen } from './PostTripScreen';
import { RatingScreen } from './RatingScreen';
import { SignUpScreen } from './SignUpScreen';
import { StartScreen } from './StartScreen';
import { TravelerHomeScreen } from './TravelerHomeScreen';
import { VerifyScreen } from './VerifyScreen';

/** Picks the screen: an open panel first, then the step and whose phone is shown */
export function ScreenRouter() {
  const { state } = useDemo();

  if (state.panel === 'postTrip') return <PostTripScreen />;
  if (state.panel === 'chat') return <ChatScreen />;

  // From delivery on, both phones share these screens
  switch (state.step) {
    case 'pickedUp':
    case 'inTransit':
    case 'delivered':
      return <DeliveryScreen />;
    case 'released':
    case 'rating':
      // Keyed by side, so one person's half-written review never shows on the other's phone
      return <RatingScreen key={state.view} />;
    case 'done':
      return <DoneScreen />;
  }

  if (state.view === 'traveler') {
    return reached(state, 'paid') ? <DeliveryScreen /> : <TravelerHomeScreen />;
  }

  switch (state.step) {
    case 'start':
      return <StartScreen />;
    case 'signup':
      return <SignUpScreen />;
    case 'verify':
      return <VerifyScreen />;
    case 'phone':
      return <PhoneScreen />;
    case 'post':
      return <PostPackageScreen />;
    case 'matches':
    case 'offerSent':
      return <MatchesScreen />;
    default:
      // offerAccepted, confirmed and paid
      return <EscrowScreen />;
  }
}
