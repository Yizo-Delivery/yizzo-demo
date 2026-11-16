import { Star } from 'lucide-react';
import { useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 text-base font-semibold transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        'disabled:cursor-not-allowed disabled:opacity-40',
        variant === 'primary'
          ? 'bg-brand text-white hover:bg-brand/90'
          : 'border border-brand/30 bg-white text-brand hover:bg-brand-soft',
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('rounded-2xl border border-stone-200 bg-white p-4', className)}>{children}</div>;
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | null;
};

export function Field({ label, error, className, ...props }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-stone-700">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cx(
          'min-h-12 rounded-xl border bg-white px-3 text-base text-foreground',
          'focus:border-brand focus:outline-2 focus:outline-brand/30',
          error ? 'border-red-600' : 'border-stone-300',
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

const PILL_TONES = {
  held: 'bg-amber-50 text-held ring-held/30',
  released: 'bg-green-50 text-released ring-released/30',
  sent: 'bg-blue-50 text-sent ring-sent/30',
  neutral: 'bg-stone-100 text-stone-700 ring-stone-300',
} as const;

export function StatusPill({ tone, children }: { tone: keyof typeof PILL_TONES; children: ReactNode }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-sm font-semibold ring-1 ring-inset',
        PILL_TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

type StarsProps = {
  value: number;
  /** Omit for a read-only display */
  onChange?: (stars: 1 | 2 | 3 | 4 | 5) => void;
  label?: string;
};

export function Stars({ value, onChange, label = 'Rating' }: StarsProps) {
  const values = [1, 2, 3, 4, 5] as const;
  if (!onChange) {
    return (
      <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`} role="img">
        {values.map((n) => (
          <Star
            key={n}
            aria-hidden
            className={cx('size-4', n <= Math.round(value) ? 'fill-accent text-accent' : 'text-stone-300')}
          />
        ))}
      </span>
    );
  }
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1">
      {values.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          onClick={() => onChange(n)}
          className="grid size-11 place-items-center rounded-xl focus-visible:outline-2 focus-visible:outline-brand"
        >
          <Star aria-hidden className={cx('size-8', n <= value ? 'fill-accent text-accent' : 'text-stone-300')} />
        </button>
      ))}
    </div>
  );
}

export { cx };
