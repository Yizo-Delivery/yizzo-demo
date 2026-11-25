'use client';

import { BadgeCheck, Fingerprint, ShieldCheck } from 'lucide-react';
import { useRef, useState, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui';
import { useDemo } from '@/demo/DemoProvider';

const SHARED = ['Full name', 'Date of birth', 'Phone number'];

/** Stands in for the provider's own pages; clearly labeled, no official logo */
function FaydaSheet({ onAllow, onCancel }: { onAllow: () => void; onCancel: () => void }) {
  const sheet = useRef<HTMLDivElement>(null);
  const buttons = () => [...(sheet.current?.querySelectorAll('button') ?? [])];

  // A modal: Escape cancels, and Tab stays inside the sheet
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
      return;
    }
    if (e.key !== 'Tab') return;
    const all = buttons();
    const first = all[0];
    const last = all.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-end bg-black/40">
      <div
        ref={sheet}
        onKeyDown={onKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fayda-sheet-title"
        className="flex w-full flex-col gap-4 rounded-t-3xl bg-white p-6 shadow-xl"
      >
        <p className="self-start rounded-full bg-accent/30 px-2.5 py-1 text-xs font-semibold text-stone-800">
          Not the real Fayda service
        </p>
        <h2 id="fayda-sheet-title" className="text-xl font-bold">
          Demo — simulated Fayda sign-in
        </h2>
        <p className="text-stone-600">Yizzo is asking to see:</p>
        <ul className="flex flex-col gap-2">
          {SHARED.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <ShieldCheck aria-hidden className="size-5 text-brand" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-sm text-stone-500">Your ID number itself is never stored by Yizzo.</p>
        <div className="flex flex-col gap-2">
          <Button focusWhenArmed onClick={onAllow}>
            Allow
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export function VerifyScreen() {
  const { dispatch } = useDemo();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [verified, setVerified] = useState(false);
  const opener = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Verify your identity</h1>
        <p className="text-stone-600">
          Everyone on Yizzo is verified with their national ID, so you always know who you&apos;re dealing with.
        </p>
      </div>

      {verified ? (
        <div className="flex flex-col gap-2 rounded-2xl bg-brand-soft p-4">
          <p className="flex items-center gap-2 font-semibold text-brand">
            <BadgeCheck aria-hidden className="size-6" />
            Verified identity
          </p>
          <p className="text-stone-700">One more step: confirm your phone.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-stone-300 p-6 text-center">
          <Fingerprint aria-hidden className="size-10 text-brand" />
          <p className="text-stone-600">You&apos;ll sign in with Fayda and choose what to share.</p>
        </div>
      )}

      <div ref={opener} className="mt-auto">
        {verified ? (
          <Button onClick={() => dispatch({ type: 'verifyIdentity' })}>Continue</Button>
        ) : (
          <Button onClick={() => setSheetOpen(true)}>Verify with Fayda</Button>
        )}
      </div>

      {sheetOpen && (
        <FaydaSheet
          onAllow={() => {
            setSheetOpen(false);
            setVerified(true);
          }}
          onCancel={() => {
            setSheetOpen(false);
            opener.current?.querySelector('button')?.focus();
          }}
        />
      )}
    </div>
  );
}
