/** Up to two capital letters: the first and last words' initials */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
}

const TINTS = [
  { bg: 'bg-brand-soft', fg: 'text-brand' },
  { bg: 'bg-sky', fg: 'text-white' },
  { bg: 'bg-brand', fg: 'text-white' },
  { bg: 'bg-amber-100', fg: 'text-amber-900' },
  { bg: 'bg-emerald-100', fg: 'text-emerald-900' },
] as const;

/** A tint picked from the name, so a person keeps the same color everywhere */
export function avatarTint(name: string): { bg: string; fg: string } {
  let sum = 0;
  for (const ch of name) sum += ch.charCodeAt(0);
  return TINTS[sum % TINTS.length];
}
