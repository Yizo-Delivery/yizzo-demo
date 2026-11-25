import { expect, test, type Page } from '@playwright/test';
import { walkTo } from './helpers';

const item = (page: Page, n: number) => page.getByRole('group', { name: `Item ${n}` });

test('package edits survive switching sides', async ({ page }) => {
  await walkTo(page, 'diaspora', 'post');
  await item(page, 1).getByLabel('Weight (kg)').fill('4.2');
  await expect(page.getByText('Total weight: 5 kg')).toBeVisible();

  await page.getByRole('button', { name: /^Traveler ·/ }).click();
  await page.getByRole('button', { name: /^Sender ·/ }).click();

  // The reward, on the Preferences step, is covered in send-form.spec.ts
  await expect(item(page, 1).getByLabel('Weight (kg)')).toHaveValue('4.2');
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

test('on a phone, tapping the banner switches to whoever is next', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'the banner is the phone layout');
  await walkTo(page, 'diaspora', 'offerSent');
  await page.getByRole('button', { name: /^Switch to Dawit/ }).click();
  await expect(page.getByRole('button', { name: 'Traveler · Dawit' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Accept' })).toBeVisible();
});

test('a reward with cents and a weight like 2.25 are accepted', async ({ page }) => {
  await walkTo(page, 'diaspora', 'post');
  await item(page, 1).getByLabel('Weight (kg)').fill('2.25');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel('Reward (USD)').fill('60.50');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Find travelers' }).click();
  await expect(page.getByRole('article', { name: 'Dawit Bekele' })).toBeVisible();
});

test('each new screen moves focus to its heading', async ({ page }) => {
  await walkTo(page, 'diaspora', 'verify');
  await expect(page.getByRole('heading', { level: 1, name: 'Verify your identity' })).toBeFocused();
});

test('the Fayda sheet keeps focus inside and closes on Escape', async ({ page }) => {
  await walkTo(page, 'diaspora', 'verify');
  await page.getByRole('button', { name: 'Verify with Fayda' }).click();
  const sheet = page.getByRole('dialog', { name: 'Demo — simulated Fayda sign-in' });
  await expect(sheet.getByRole('button', { name: 'Allow' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(sheet.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(sheet.getByRole('button', { name: 'Allow' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Verify with Fayda' })).toBeFocused();
});

test('the turn dot stays still when reduced motion is on', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await walkTo(page, 'diaspora', 'offerSent');
  const dot = page.getByRole('button', { name: 'Traveler · Dawit' }).locator('span[aria-hidden]');
  await expect(dot).toBeVisible();
  expect(await dot.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
});

test('the wrong-code message goes away once you change the code', async ({ page }) => {
  await walkTo(page, 'diaspora', 'phone');
  await page.getByLabel('Code').fill('111111');
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByText("That code isn't right")).toBeVisible();
  await page.getByLabel('Code').fill('11111');
  await expect(page.getByText("That code isn't right")).toHaveCount(0);
});
