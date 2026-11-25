'use client';

import { Star } from 'lucide-react';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  /** Take focus once armed (a disabled button can't be focused before that) */
  focusWhenArmed?: boolean;
};

/**
 * How long a newly shown button ignores taps. The next screen's button often
 * appears right where the last one was, so without this the second tap of a
 * double tap (100–250 ms apart) would skip a screen.
 */
export const ARM_MS = 350;

/** False for ARM_MS after mount; for controls drawn where a tap may still be landing */
export function useArmed(): boolean {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setArmed(true), ARM_MS);
    return () => clearTimeout(timer);
  }, []);
  return armed;
}

export function Button({
  variant = 'primary',
  className,
  type = 'button',
  disabled,
  focusWhenArmed = false,
  ...props
}: ButtonProps) {
  const armed = useArmed();
  const self = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (armed && focusWhenArmed) self.current?.focus();
  }, [armed, focusWhenArmed]);

  return (
    <button
      ref={self}
      type={type}
      // Not armed yet: inert, but drawn as enabled so nothing flickers
      disabled={disabled || !armed}
      className={cx(
        'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 text-base font-semibold transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        disabled && 'cursor-not-allowed opacity-40',
        variant === 'primary'
          ? 'bg-brand text-white shadow-sm hover:bg-brand/90'
          : 'border border-brand/40 bg-white text-brand hover:bg-brand-soft',
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('rounded-[20px] bg-white p-4 shadow-[0_1px_3px_rgb(11_31_75/0.08),0_4px_16px_rgb(11_31_75/0.06)]', className)}>{children}</div>;
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
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cx(
          'min-h-12 rounded-xl border bg-white px-3 text-base text-foreground',
          'focus:border-brand focus:outline-2 focus:outline-brand/30',
          error ? 'border-red-600' : 'border-slate-300',
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
  neutral: 'bg-slate-100 text-slate-700 ring-slate-300',
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
            className={cx('size-4', n <= Math.round(value) ? 'fill-accent text-accent' : 'text-slate-300')}
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
          <Star aria-hidden className={cx('size-8', n <= value ? 'fill-accent text-accent' : 'text-slate-300')} />
        </button>
      ))}
    </div>
  );
}

export { cx };
