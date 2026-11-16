'use client';

import { useDemo } from '@/demo/DemoProvider';
import { MatchesScreen } from './MatchesScreen';
import { PhoneScreen } from './PhoneScreen';
import { PostPackageScreen } from './PostPackageScreen';
import { SignUpScreen } from './SignUpScreen';
import { StartScreen } from './StartScreen';
import { VerifyScreen } from './VerifyScreen';

/** Stands in for screens later tasks add */
function Placeholder({ name }: { name: string }) {
  return (
    <div className="flex flex-1 items-center justify-center p-6 text-center text-stone-500">
      <p>This screen ({name}) is still being built.</p>
    </div>
  );
}

/** Picks the screen: an open panel first, then the step and whose phone is shown */
export function ScreenRouter() {
  const { state } = useDemo();

  if (state.panel !== null) return <Placeholder name={state.panel} />;

  if (state.view === 'traveler') return <Placeholder name={`${state.step}, traveler`} />;

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
      return <Placeholder name={`${state.step}, ${state.view}`} />;
  }
}
