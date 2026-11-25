import { cx } from './ui';

/** The paper plane on its own, for backgrounds and icons */
export function PaperPlane({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none">
      <path d="M21.5 2.5 2.8 10.1c-.7.3-.7 1.3 0 1.6l6.1 2.4 2.4 6.1c.3.7 1.3.7 1.6 0L21.5 2.5Z" fill="currentColor" />
      <path d="m21.5 2.5-12.6 11.6" stroke="white" strokeOpacity=".55" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** The Yizzo wordmark with its paper plane */
export function Logo({ size = 'sm', tone = 'brand' }: { size?: 'sm' | 'lg'; tone?: 'brand' | 'white' }) {
  return (
    <span
      role="img"
      aria-label="Yizzo"
      className={cx(
        'inline-flex items-center gap-1.5 font-extrabold tracking-tight',
        size === 'sm' ? 'text-xl' : 'text-4xl',
        tone === 'brand' ? 'text-brand' : 'text-white',
      )}
    >
      <span aria-hidden>Yizzo</span>
      <PaperPlane className={cx(size === 'sm' ? 'size-5' : 'size-9', tone === 'brand' ? 'text-sky' : 'text-white')} />
    </span>
  );
}
