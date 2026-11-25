import { Check } from 'lucide-react';
import { cx } from './ui';

/** Where the investor is in a short multi-step form */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol aria-label="Steps" className="flex items-start gap-2">
      {steps.map((label, i) => {
        const done = i < current;
        const now = i === current;
        return (
          <li
            key={label}
            aria-current={now ? 'step' : undefined}
            className="flex flex-1 flex-col items-center gap-1.5 text-center"
          >
            <span
              className={cx(
                'grid size-8 place-items-center rounded-full text-sm font-bold',
                done && 'bg-sky text-white',
                now && 'bg-brand text-white',
                !done && !now && 'bg-brand-soft text-brand',
              )}
            >
              {done ? <Check aria-hidden className="size-4" /> : i + 1}
            </span>
            <span className={cx('text-xs font-semibold', now ? 'text-brand' : 'text-slate-600')}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
