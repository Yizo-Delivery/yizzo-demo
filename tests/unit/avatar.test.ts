import { describe, expect, it } from 'vitest';
import { avatarTint, initials } from '@/components/avatarTint';

describe('initials', () => {
  it('takes the first and last words', () => {
    expect(initials('Dawit Bekele')).toBe('DB');
    expect(initials('  selam  tesfaye ')).toBe('ST');
  });

  it('uses one letter for a single name', () => {
    expect(initials('Meron')).toBe('M');
  });
});

describe('avatarTint', () => {
  it('gives the same tint for the same name', () => {
    expect(avatarTint('Dawit Bekele')).toEqual(avatarTint('Dawit Bekele'));
  });

  it('varies across names', () => {
    const names = ['Dawit Bekele', 'Hirut Alemu', 'Yonas Girma', 'Abebe Tadesse', 'Tigist Mengistu'];
    const tints = new Set(names.map((n) => avatarTint(n).bg));
    expect(tints.size).toBeGreaterThan(1);
  });
});
