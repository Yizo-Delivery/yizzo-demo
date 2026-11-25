'use client';

import { Button } from '@/components/ui';
import { useDemo } from '@/demo/DemoProvider';

/** The sender's home once the account is active */
export function HomeScreen() {
  const { state, dispatch } = useDemo();
  const first = (state.account?.name ?? '').trim().split(/\s+/)[0];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold tracking-tight break-words">Hi, {first}</h1>
      <Button onClick={() => dispatch({ type: 'startSend' })}>Send an Item</Button>
    </div>
  );
}
