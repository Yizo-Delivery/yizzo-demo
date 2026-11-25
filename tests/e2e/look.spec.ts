import { expect, test } from '@playwright/test';
import { walkTo } from './helpers';

test('the app bar shows the Yizzo logo after Welcome', async ({ page }) => {
  await walkTo(page, 'diaspora', 'signup');
  await expect(page.locator('header').getByRole('img', { name: 'Yizzo' })).toBeVisible();
});

test('primary buttons are navy', async ({ page }) => {
  await walkTo(page, 'diaspora', 'signup');
  const bg = await page.getByRole('button', { name: 'Create account' }).evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).toBe('rgb(11, 31, 75)');
});
