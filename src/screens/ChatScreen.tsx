'use client';

import { ArrowLeft, SendHorizontal } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { cx } from '@/components/ui';
import { useDemo } from '@/demo/DemoProvider';
import { MAX_MESSAGE_LENGTH } from '@/demo/reducer';

export function ChatScreen() {
  const { state, story, dispatch } = useDemo();
  const [text, setText] = useState('');
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [state.messages.length]);

  if (story === null) return null;

  const traveler = story.travelers.find((t) => t.id === state.chosenTravelerId) ?? story.travelers[0];
  const other = state.view === 'sender' ? traveler.name : story.sender.name;
  const trimmed = text.trim();
  const canSend = trimmed.length > 0 && trimmed.length <= MAX_MESSAGE_LENGTH;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    dispatch({ type: 'sendMessage', text });
    setText('');
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-stone-200 bg-white px-2 py-2">
        <button
          type="button"
          aria-label="Back"
          onClick={() => dispatch({ type: 'closePanel' })}
          className="grid size-11 place-items-center rounded-xl text-stone-700 hover:bg-stone-100"
        >
          <ArrowLeft aria-hidden className="size-5" />
        </button>
        <h1 className="text-lg font-semibold">{other}</h1>
      </div>

      <div role="log" aria-label="Messages" className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {state.messages.map((m) => {
          const mine = m.from === state.view;
          return (
            <p
              key={m.id}
              className={cx(
                'max-w-[80%] rounded-2xl px-3.5 py-2 break-words whitespace-pre-wrap',
                mine ? 'self-end rounded-br-md bg-brand text-white' : 'self-start rounded-bl-md bg-white text-foreground ring-1 ring-stone-200',
              )}
            >
              {m.text}
            </p>
          );
        })}
        <div ref={end} />
      </div>

      <form onSubmit={submit} className="flex items-end gap-2 border-t border-stone-200 bg-white p-3">
        <textarea
          aria-label="Write a message"
          rows={1}
          maxLength={MAX_MESSAGE_LENGTH}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Message"
          className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-stone-300 px-3 py-2.5 text-base focus:border-brand focus:outline-2 focus:outline-brand/30"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={!canSend}
          className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-white disabled:opacity-40"
        >
          <SendHorizontal aria-hidden className="size-5" />
        </button>
      </form>
    </div>
  );
}
