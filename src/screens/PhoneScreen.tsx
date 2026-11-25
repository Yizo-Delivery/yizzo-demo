'use client';

import { BadgeCheck, MessageSquareText } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button, Field } from '@/components/ui';
import { useDemo } from '@/demo/DemoProvider';

export function PhoneScreen() {
  const { state, story, dispatch } = useDemo();
  const [code, setCode] = useState('');
  const [active, setActive] = useState(false);
  // The code that was rejected: the message goes once the code changes
  const [rejected, setRejected] = useState<string | null>(null);
  if (story === null) return null;

  const complete = /^\d{6}$/.test(code);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!complete) return;
    // The right code shows the success state first; Continue moves on.
    // A wrong one goes to the reducer, which records the error.
    if (code === story.phoneCode) setActive(true);
    else {
      setRejected(code);
      dispatch({ type: 'confirmPhone', code });
    }
  };

  if (active) {
    return (
      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-brand-soft p-6 text-center">
          <BadgeCheck aria-hidden className="size-12 text-brand" />
          <p className="text-xl font-bold text-brand">Your account is active</p>
          <p className="text-slate-700">Identity and phone verified. You can send and carry packages.</p>
        </div>
        <Button className="mt-auto" onClick={() => dispatch({ type: 'confirmPhone', code })}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Confirm your phone</h1>
        <p className="text-slate-600">We texted a code to {story.sender.phoneMasked}</p>
      </div>

      <Field
        label="Code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
        error={state.codeError && code === rejected ? "That code isn't right" : null}
        className="[&_input]:text-center [&_input]:text-2xl [&_input]:tracking-[0.4em]"
      />

      <div className="flex items-center gap-3 rounded-2xl border border-accent bg-accent/10 p-3">
        <MessageSquareText aria-hidden className="size-5 shrink-0 text-slate-700" />
        <p className="flex-1 text-sm text-slate-700">Demo code: {story.phoneCode}</p>
        <button
          type="button"
          onClick={() => setCode(story.phoneCode)}
          className="min-h-11 rounded-xl px-3 text-sm font-semibold text-brand hover:bg-accent/20"
        >
          Fill code
        </button>
      </div>

      <Button type="submit" disabled={!complete} className="mt-auto">
        Confirm
      </Button>
    </form>
  );
}
