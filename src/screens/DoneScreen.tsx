'use client';

import { BadgeCheck, CheckCircle2, Flag, Gavel, LayoutDashboard } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { useDemo } from '@/demo/DemoProvider';
import { computeFees, formatMoney } from '@/demo/fees';
import type { StoryId } from '@/demo/types';

const first = (name: string) => name.split(' ')[0];

/** Built in the backend but not tapped through here */
const ALSO_BUILT = [
  { Icon: Gavel, text: 'Disputes freeze the escrow, and an admin resolves them.' },
  { Icon: Flag, text: 'Users can report someone, and admins can take content down.' },
  { Icon: LayoutDashboard, text: 'An admin dashboard with an audit log of every action.' },
];

export function DoneScreen() {
  const { state, story, dispatch } = useDemo();
  if (story === null || state.pkg === null) return null;

  const traveler = story.travelers.find((t) => t.id === state.chosenTravelerId) ?? story.travelers[0];
  const fees = state.fees ?? computeFees(state.pkg.reward, story.currency);
  const money = (n: number) => formatMoney(n, story.currency);
  const sender = first(story.sender.name);
  const carrier = first(traveler.name);
  const other: StoryId = story.id === 'diaspora' ? 'domestic' : 'diaspora';

  const recap = [
    `${sender} verified her identity with Fayda and her phone.`,
    `Yizzo matched her package with ${carrier}, the best traveler on the route.`,
    `She paid ${money(fees.total)} into escrow.`,
    `${carrier} delivered it and received ${money(fees.reward)}; Yizzo kept ${money(fees.fee)}.`,
    'They rated each other.',
  ];

  return (
    <div className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex flex-col gap-2">
        <BadgeCheck aria-hidden className="size-10 text-brand" />
        <h1 className="text-2xl font-bold tracking-tight">That&apos;s one delivery</h1>
      </div>

      <ol className="flex flex-col gap-2">
        {recap.map((line) => (
          <li key={line} className="flex items-start gap-2 text-stone-800">
            <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-brand" />
            {line}
          </li>
        ))}
      </ol>

      <Card className="flex flex-col gap-3">
        <h2 className="font-semibold">Also built, not shown here</h2>
        <ul className="flex flex-col gap-2">
          {ALSO_BUILT.map(({ Icon, text }) => (
            <li key={text} className="flex items-start gap-2 text-sm text-stone-700">
              <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-stone-500" />
              {text}
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-auto flex flex-col gap-2">
        <Button
          onClick={() => {
            dispatch({ type: 'restart' });
            dispatch({ type: 'chooseStory', story: other });
          }}
        >
          Try the other story
        </Button>
        <Button variant="secondary" onClick={() => dispatch({ type: 'restart' })}>
          Start over
        </Button>
      </div>
    </div>
  );
}
