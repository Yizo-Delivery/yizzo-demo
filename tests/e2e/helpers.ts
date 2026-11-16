import { expect, type Page } from '@playwright/test';
import type { Step, StoryId } from '../../src/demo/types';

/** The next-step line, from the banner (phone) or the guide panel (laptop) */
export const nextStep = (page: Page) => page.getByTestId('next-step').filter({ visible: true });

const ORDER: Step[] = ['start', 'signup', 'verify', 'phone', 'post'];

/**
 * Drives the demo from a fresh page to `step`, using only what a person can
 * tap. Each later task extends it with the steps it adds.
 */
export async function walkTo(page: Page, story: StoryId, step: Step): Promise<void> {
  const target = ORDER.indexOf(step);
  if (target === -1) throw new Error(`walkTo doesn't reach "${step}" yet`);

  await page.goto('/');
  if (target === 0) return;

  await page.getByRole('button', { name: story === 'diaspora' ? /Diaspora/ : /Domestic/ }).click();
  if (target === 1) return;

  await page.getByRole('button', { name: 'Create account' }).click();
  if (target === 2) return;

  await page.getByRole('button', { name: 'Verify with Fayda' }).click();
  await page.getByRole('button', { name: 'Allow' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  if (target === 3) return;

  await page.getByRole('button', { name: 'Fill code' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(nextStep(page)).toHaveText('Tap Find travelers.');
}
