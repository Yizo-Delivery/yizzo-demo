'use client';

import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';

/**
 * A bottom sheet over the app frame. A modal: Escape closes it, Tab stays
 * inside, focus starts on its first button and goes back to the opener.
 */
export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const titleId = useId();
  const sheet = useRef<HTMLDivElement>(null);
  const buttons = () => [...(sheet.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? [])];

  // Escape closes it even before focus has moved inside
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    const onEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      close.current();
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, []);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    // The buttons inside may still be arming, so try until one takes focus
    const timer = setInterval(() => {
      const first = buttons()[0];
      if (first) {
        first.focus();
        clearInterval(timer);
      }
    }, 50);
    return () => {
      clearInterval(timer);
      opener?.focus();
    };
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
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
    <div className="absolute inset-0 z-30 flex items-end bg-black/40" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={sheet}
        onKeyDown={onKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="sheet-up flex max-h-full w-full flex-col gap-4 overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl"
      >
        <div aria-hidden className="mx-auto h-1.5 w-10 rounded-full bg-slate-300" />
        <h2 id={titleId} className="text-xl font-bold text-brand">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
