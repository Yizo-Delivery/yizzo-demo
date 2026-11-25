import type { ReactNode } from 'react';
import type { Country } from '@/demo/types';
import { cx } from './ui';

/** Small inline flags (emoji flags don't render on Windows). Decorative: write the country beside it. */
export function Flag({ country, className }: { country: Country; className?: string }) {
  return (
    <svg viewBox="0 0 30 20" aria-hidden className={cx('h-4 w-6 shrink-0 overflow-hidden rounded-[3px] shadow-sm', className)}>
      {FLAGS[country]}
    </svg>
  );
}

const FLAGS: Record<Country, ReactNode> = {
  US: (
    <>
      <rect width="30" height="20" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={i} y={(i * 20) / 13} width="30" height={20 / 13} fill="#B22234" />
      ))}
      <rect width="13" height={(20 * 7) / 13} fill="#3C3B6E" />
    </>
  ),
  GB: (
    <>
      <rect width="30" height="20" fill="#012169" />
      <path d="M0 0 30 20M30 0 0 20" stroke="#fff" strokeWidth="4" />
      <path d="M0 0 30 20M30 0 0 20" stroke="#C8102E" strokeWidth="1.6" />
      <path d="M15 0v20M0 10h30" stroke="#fff" strokeWidth="6" />
      <path d="M15 0v20M0 10h30" stroke="#C8102E" strokeWidth="3.4" />
    </>
  ),
  CA: (
    <>
      <rect width="30" height="20" fill="#fff" />
      <rect width="7.5" height="20" fill="#D80621" />
      <rect x="22.5" width="7.5" height="20" fill="#D80621" />
      <path d="M15 4l1.2 2.6 1.9-.7-.6 3.3 2-1.4.5 1.4 1.6-.3-1 2.4 1 .5-3.8 2.6.4 1.4H15.6V18h-1.2v-2.2h-2.6l.4-1.4L8.4 11.8l1-.5-1-2.4 1.6.3.5-1.4 2 1.4-.6-3.3 1.9.7Z" fill="#D80621" />
    </>
  ),
  ET: (
    <>
      <rect width="30" height="20" fill="#DA121A" />
      <rect width="30" height="13.33" fill="#FCDD09" />
      <rect width="30" height="6.67" fill="#078930" />
      <circle cx="15" cy="10" r="5" fill="#0F47AF" />
      <path d="M15 6.6l.9 2.6h2.7l-2.2 1.6.8 2.6-2.2-1.6-2.2 1.6.8-2.6-2.2-1.6h2.7Z" fill="none" stroke="#FCDD09" strokeWidth=".6" />
    </>
  ),
};
