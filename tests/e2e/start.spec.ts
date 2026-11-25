import { expect, test } from '@playwright/test';
import { pickStory } from './helpers';

test('Welcome shows the tagline, Get Started and the sample-data note', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('People move the world closer.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
  await expect(page.getByText('Demo with sample data')).toBeVisible();
  await expect(page.getByRole('button', { name: 'I already have an account' })).toHaveCount(0);
});

test('Get Started opens the story sheet; Escape closes it and returns focus', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Get Started' }).click();
  const sheet = page.getByRole('dialog', { name: 'Pick a story' });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole('button', { name: /Diaspora|Domestic/ })).toHaveCount(2);
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
  await expect(page.getByRole('button', { name: 'Get Started' })).toBeFocused();
});

test('picking a story starts sign-up', async ({ page }) => {
  await page.goto('/');
  await pickStory(page, 'domestic');
  await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
});

test('choosing Diaspora opens sign-up prefilled with Selam', async ({ page }) => {
  await page.goto('/');
  await pickStory(page, 'diaspora');
  await expect(page.getByLabel('Full name')).toHaveValue('Selam Tesfaye');
  await expect(page.getByLabel('Email')).toHaveValue('selam@example.com');
});

test('choosing Domestic opens sign-up prefilled with Meron', async ({ page }) => {
  await page.goto('/');
  await pickStory(page, 'domestic');
  await expect(page.getByLabel('Full name')).toHaveValue('Meron Haile');
});

test('Restart returns to Welcome', async ({ page }) => {
  await page.goto('/');
  await pickStory(page, 'diaspora');
  await expect(page.getByLabel('Full name')).toBeVisible();
  await page.getByRole('button', { name: 'Restart demo' }).filter({ visible: true }).click();
  await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
  await expect(page.getByLabel('Full name')).toHaveCount(0);
});

test('the guide tells you what to do next', async ({ page }) => {
  await page.goto('/');
  // The banner (phone) and the guide panel (laptop) both carry it; one shows at each size
  await expect(page.getByText('Tap Get Started, then pick a story.').filter({ visible: true })).toHaveCount(1);
  await pickStory(page, 'diaspora');
  await expect(page.getByText('Tap Create account.').filter({ visible: true })).toHaveCount(1);
});

test('nothing scrolls sideways', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
