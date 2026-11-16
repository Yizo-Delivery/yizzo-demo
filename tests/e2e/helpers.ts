import { expect, type Page } from '@playwright/test';
import type { Step, StoryId } from '../../src/demo/types';

/** The next-step line, from the banner (phone) or the guide panel (laptop) */
export const nextStep = (page: Page) => page.getByTestId('next-step').filter({ visible: true });

type Leg = (page: Page) => Promise<void>;

/**
 * How to get from the previous step to each step, using only what a person
 * can tap. Each later task adds the legs for the steps it builds.
 */
const LEGS: [Step, Leg][] = [
  [
    'verify',
    async (page) => {
      await page.getByRole('button', { name: 'Create account' }).click();
    },
  ],
  [
    'phone',
    async (page) => {
      await page.getByRole('button', { name: 'Verify with Fayda' }).click();
      await page.getByRole('button', { name: 'Allow' }).click();
      await page.getByRole('button', { name: 'Continue' }).click();
    },
  ],
  [
    'post',
    async (page) => {
      await page.getByRole('button', { name: 'Fill code' }).click();
      await page.getByRole('button', { name: 'Confirm' }).click();
      await page.getByRole('button', { name: 'Continue' }).click();
      await expect(nextStep(page)).toHaveText('Tap Find travelers.');
    },
  ],
  [
    'matches',
    async (page) => {
      await page.getByRole('button', { name: 'Find travelers' }).click();
      await expect(page.getByRole('article').first()).toBeVisible();
    },
  ],
  [
    'offerSent',
    async (page) => {
      const best = page.getByRole('article').first();
      await best.getByRole('button', { name: 'Send offer' }).click();
      await expect(best.getByText('Offer sent')).toBeVisible();
    },
  ],
  [
    'offerAccepted',
    async (page) => {
      await page.getByRole('button', { name: /^Traveler ·/ }).click();
      await page.getByRole('button', { name: 'Accept' }).click();
      await expect(page.getByText(/^Waiting for .* to confirm$/)).toBeVisible();
    },
  ],
  [
    'confirmed',
    async (page) => {
      await page.getByRole('button', { name: /^Sender ·/ }).click();
      await page.getByRole('button', { name: /^Confirm / }).click();
      await expect(page.getByRole('button', { name: /into escrow$/ })).toBeVisible();
    },
  ],
  [
    'paid',
    async (page) => {
      await page.getByRole('button', { name: /into escrow$/ }).click();
      await expect(page.getByText('Held', { exact: true })).toBeVisible();
    },
  ],
];

/** Drives the demo from a fresh page to `step` */
export async function walkTo(page: Page, story: StoryId, step: Step): Promise<void> {
  await page.goto('/');
  if (step === 'start') return;

  await page.getByRole('button', { name: story === 'diaspora' ? /Diaspora/ : /Domestic/ }).click();
  if (step === 'signup') return;

  const last = LEGS.findIndex(([s]) => s === step);
  if (last === -1) throw new Error(`walkTo doesn't reach "${step}" yet`);
  for (const [, leg] of LEGS.slice(0, last + 1)) await leg(page);
}
