import { expect, test, type Page } from '@playwright/test';
import { nextStep, walkTo } from './helpers';
import type { Step } from '../../src/demo/types';

const tabs = (page: Page) => page.getByRole('navigation', { name: 'Tabs' });
const tab = (page: Page, name: string) => tabs(page).getByRole('button', { name, exact: true });
const h1 = (page: Page) => page.locator('main h1');
const current = (page: Page) => page.getByRole('list', { name: 'Steps' }).locator('[aria-current="step"]');

for (const step of ['home', 'paid', 'done'] as Step[]) {
  test(`each tab opens a screen and Home returns to the flow (${step})`, async ({ page }) => {
    await walkTo(page, 'diaspora', step);
    const before = await h1(page).innerText();
    for (const name of ['Search', 'Trips', 'Profile']) {
      await tab(page, name).click();
      await expect(h1(page)).toHaveText(name);
      await expect(tab(page, name)).toHaveAttribute('aria-current', 'page');
      await tab(page, 'Home').click();
      await expect(h1(page)).toHaveText(before);
    }
  });
}

test('the tab bar is hidden during onboarding, in the Send form and in chat', async ({ page }) => {
  await walkTo(page, 'diaspora', 'signup');
  await expect(tabs(page)).toHaveCount(0);
  await walkTo(page, 'diaspora', 'post');
  await expect(tabs(page)).toHaveCount(0);
  await walkTo(page, 'diaspora', 'offerSent');
  await expect(tabs(page)).toHaveCount(1);
  await page.getByRole('button', { name: /^Message / }).click();
  await expect(tabs(page)).toHaveCount(0);
});

test('Search before posting offers Send an Item', async ({ page }) => {
  await walkTo(page, 'diaspora', 'home');
  await tab(page, 'Search').click();
  await expect(page.getByRole('article')).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Send offer' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Post your item' }).click();
  await expect(current(page)).toContainText('Item details');
});

test("Search on the traveler's phone shows the posted package", async ({ page }) => {
  await walkTo(page, 'diaspora', 'home');
  await page.getByRole('button', { name: /^Traveler ·/ }).click();
  await tab(page, 'Search').click();
  await expect(page.getByText('No packages on your routes yet')).toBeVisible();

  await walkTo(page, 'diaspora', 'offerSent');
  await page.getByRole('button', { name: /^Traveler ·/ }).click();
  await tab(page, 'Search').click();
  await expect(page.locator('main')).toContainText('Washington, DC → Addis Ababa');
  await expect(page.locator('main')).toContainText('$60.00');
});

test('Trips shows the delivery status', async ({ page }) => {
  await walkTo(page, 'diaspora', 'paid');
  await tab(page, 'Trips').click();
  await expect(page.locator('main').getByText('Held', { exact: true })).toBeVisible();

  await walkTo(page, 'diaspora', 'home');
  await tab(page, 'Trips').click();
  await expect(page.getByText('No deliveries yet')).toBeVisible();
  await page.locator('main').getByRole('button', { name: 'Send an Item' }).click();
  await expect(current(page)).toContainText('Item details');
});

test('Profile shows the verified ticks and restarts', async ({ page }) => {
  await walkTo(page, 'diaspora', 'home');
  await tab(page, 'Profile').click();
  await expect(page.getByText('Fayda verified')).toBeVisible();
  await expect(page.getByText('Phone confirmed')).toBeVisible();
  await page.locator('main').getByRole('button', { name: 'Restart demo' }).click();
  await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
});

test('New starts the form at home, and explains itself after', async ({ page }) => {
  await walkTo(page, 'diaspora', 'home');
  await tab(page, 'New').click();
  await expect(current(page)).toContainText('Item details');

  await walkTo(page, 'diaspora', 'matches');
  await tab(page, 'New').click();
  const sheet = page.getByRole('dialog', { name: 'One package at a time in the demo' });
  await expect(sheet).toBeVisible();
  await sheet.getByRole('button', { name: 'Back to my package' }).click();
  await expect(sheet).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Available Travelers' })).toBeVisible();
});

test("New on the traveler's phone opens Post a trip", async ({ page }) => {
  await walkTo(page, 'diaspora', 'home');
  await page.getByRole('button', { name: /^Traveler ·/ }).click();
  await tab(page, 'New').click();
  await expect(page.getByRole('heading', { name: 'Post a trip' })).toBeVisible();
});

test('banner switch closes a tab panel', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'the banner is the phone layout');
  await walkTo(page, 'diaspora', 'offerSent');
  await tab(page, 'Trips').click();
  await expect(nextStep(page)).toHaveText('Tap Home to continue.');
  await tab(page, 'Home').click();
  await page.getByRole('button', { name: /^Switch to Dawit/ }).click();
  await expect(page.getByRole('button', { name: 'Traveler · Dawit' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Accept' })).toBeVisible();
});
