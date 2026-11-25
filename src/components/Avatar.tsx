import { avatarTint, initials } from './avatarTint';
import { cx } from './ui';

const SIZES = { sm: 'size-9 text-sm', md: 'size-12 text-base', lg: 'size-16 text-xl' } as const;

/** Initials in a tinted circle; never a photo. Callers show the name as text beside it. */
export function Avatar({ name, size = 'md' }: { name: string; size?: keyof typeof SIZES }) {
  const { bg, fg } = avatarTint(name);
  return (
    <span aria-hidden className={cx('grid shrink-0 place-items-center rounded-full font-bold', SIZES[size], bg, fg)}>
      {initials(name)}
    </span>
  );
}
