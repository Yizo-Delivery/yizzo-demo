import { expect, test, type Page } from '@playwright/test';
import { walkTo } from './helpers';

const item = (page: Page, n: number) => page.getByRole('group', { name: `Item ${n}` });

test('package edits survive switching sides', async ({ page }) => {
  await walkTo(page, 'diaspora', 'post');
  await item(page, 1).getByLabel('Weight (kg)').fill('4.2');
  await page.getByLabel('Reward (USD)').fill('75');
  await expect(page.getByText('Total weight: 5 kg')).toBeVisible();

  await page.getByRole('button', { name: /^Traveler ·/ }).click();
  await page.getByRole('button', { name: /^Sender ·/ }).click();

  await expect(item(page, 1).getByLabel('Weight (kg)')).toHaveValue('4.2');
  await expect(page.getByLabel('Reward (USD)')).toHaveValue('75');
  await expect(page.getByText('Total weight: 5 kg')).toBeVisible();
});

test('Restart forgets package edits', async ({ page }) => {
  await walkTo(page, 'diaspora', 'post');
  await item(page, 1).getByLabel('Weight (kg)').fill('4.2');
  await page.getByRole('button', { name: 'Restart demo' }).filter({ visible: true }).click();

  await walkTo(page, 'diaspora', 'post');
  await expect(item(page, 1).getByLabel('Weight (kg)')).toHaveValue('2.2');
});

test('an offer to Hirut shows Hirut’s own trip and chat', async ({ page }) => {
  await walkTo(page, 'diaspora', 'matches');
  await page.getByRole('article', { name: 'Hirut Alemu' }).getByRole('button', { name: 'Send offer' }).click();

  await page.getByRole('button', { name: 'Traveler · Hirut' }).click();
  await expect(page.getByText('Dec 5 – Dec 6')).toBeVisible();
  await expect(page.getByText('5 kg capacity')).toBeVisible();
  await expect(page.getByText('Dec 4 – Dec 5')).toHaveCount(0);

  await page.getByRole('button', { name: 'Message Selam' }).click();
  await expect(page.getByRole('heading', { name: 'Selam Tesfaye' })).toBeVisible();
  await expect(page.getByRole('log', { name: 'Messages' })).not.toContainText('Dec 4');
});
