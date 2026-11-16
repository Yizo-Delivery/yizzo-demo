import { expect, test } from '@playwright/test';

test('start screen shows the wordmark, both stories and the sample-data note', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Yizzo', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Diaspora/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Domestic/ })).toBeVisible();
  await expect(page.getByText('Demo with sample data')).toBeVisible();
});

test('choosing Diaspora opens sign-up prefilled with Selam', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Diaspora/ }).click();
  await expect(page.getByLabel('Full name')).toHaveValue('Selam Tesfaye');
  await expect(page.getByLabel('Email')).toHaveValue('selam@example.com');
});

test('choosing Domestic opens sign-up prefilled with Meron', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Domestic/ }).click();
  await expect(page.getByLabel('Full name')).toHaveValue('Meron Haile');
});

test('Restart returns to the start screen', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Diaspora/ }).click();
  await expect(page.getByLabel('Full name')).toBeVisible();
  await page.getByRole('button', { name: 'Restart demo' }).click();
  await expect(page.getByRole('button', { name: /Diaspora/ })).toBeVisible();
  await expect(page.getByLabel('Full name')).toHaveCount(0);
});

test('the guide tells you what to do next', async ({ page }) => {
  await page.goto('/');
  // The banner (phone) and the guide panel (laptop) both carry it; one shows at each size
  await expect(page.getByText('Pick a story to begin.').filter({ visible: true })).toHaveCount(1);
  await page.getByRole('button', { name: /Diaspora/ }).click();
  await expect(page.getByText('Tap Create account.').filter({ visible: true })).toHaveCount(1);
});

test('nothing scrolls sideways', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
