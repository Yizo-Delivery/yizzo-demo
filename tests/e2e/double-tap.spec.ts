import { expect, test } from '@playwright/test';
import { walkTo } from './helpers';

// A double tap must never skip a screen: the second tap lands where the
// first one's button was, and the next screen's button often sits there.

test('double-tapping Confirm on the phone code still shows the account is active', async ({ page }) => {
  await walkTo(page, 'diaspora', 'phone');
  await page.getByRole('button', { name: 'Fill code' }).click();
  await page.getByRole('button', { name: 'Confirm' }).dblclick();
  await expect(page.getByText('Your account is active')).toBeVisible();
});

test('double-tapping Confirm Dawit stops on the payment screen', async ({ page }) => {
  await walkTo(page, 'diaspora', 'offerAccepted');
  await page.getByRole('button', { name: /^Sender ·/ }).click();
  await page.getByRole('button', { name: 'Confirm Dawit' }).dblclick();
  await expect(page.getByRole('button', { name: 'Pay $71.28 into escrow' })).toBeVisible();
  await expect(page.getByText('Held', { exact: true })).toHaveCount(0);
});

test('double-tapping Mark picked up moves one step', async ({ page }) => {
  await walkTo(page, 'diaspora', 'paid');
  await page.getByRole('button', { name: /^Traveler ·/ }).click();
  await page.getByRole('button', { name: 'Mark picked up' }).dblclick();
  await expect(page.getByRole('button', { name: 'Mark in transit' })).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'In transit' })).toHaveAttribute('aria-current', 'step');
});

test('double-tapping See summary stays on the summary', async ({ page }) => {
  await walkTo(page, 'diaspora', 'rating');
  await page.getByRole('button', { name: /^Traveler ·/ }).click();
  await page.getByRole('radio', { name: '5 stars' }).click();
  await page.getByRole('button', { name: 'Submit rating' }).click();
  await page.getByRole('button', { name: 'See summary' }).dblclick();
  await expect(page.getByRole('heading', { name: "That's one delivery", level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try the other story' })).toBeVisible();
});
