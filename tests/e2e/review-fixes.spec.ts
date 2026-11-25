import { expect, test, type Locator, type Page } from '@playwright/test';
import path from 'node:path';
import { walkTo } from './helpers';

const PHOTO = path.join(__dirname, 'fixtures', 'photo.png');
const item = (page: Page, n: number) => page.getByRole('group', { name: `Item ${n}` });

async function pickAndPost(page: Page) {
  await walkTo(page, 'diaspora', 'post');
  await item(page, 1).getByLabel('Add photo for Laptop').setInputFiles(PHOTO);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
}

test('Review shows the picked photo', async ({ page }) => {
  await pickAndPost(page);
  await expect(page.locator('main img[src^="blob:"]').first()).toBeVisible();
});

test("the traveler's Search and Trips show the picked photo", async ({ page }) => {
  await pickAndPost(page);
  await page.getByRole('button', { name: 'Find travelers' }).click();
  await page.getByRole('article').first().getByRole('button', { name: 'Send offer' }).click();
  await page.getByRole('button', { name: /^Traveler ·/ }).click();
  const tabs = page.getByRole('navigation', { name: 'Tabs' });
  await tabs.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.locator('main img[src^="blob:"]').first()).toBeVisible();
  await tabs.getByRole('button', { name: 'Trips', exact: true }).click();
  await expect(page.locator('main img[src^="blob:"]').first()).toBeVisible();
});

/** WCAG contrast of an element's text against its own background */
const contrast = (el: Locator) =>
  el.evaluate((node) => {
    const rgb = (c: string) => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const s = getComputedStyle(node);
    const [a, b] = [lum(rgb(s.color)), lum(rgb(s.backgroundColor))].sort((x, y) => y - x);
    return (a + 0.05) / (b + 0.05);
  });

test('the Best match badge and avatars pass AA contrast', async ({ page }) => {
  await walkTo(page, 'diaspora', 'matches');
  expect(await contrast(page.getByText('Best match', { exact: true }))).toBeGreaterThanOrEqual(4.5);
  for (const initials of ['DB', 'HA', 'YG']) {
    expect(await contrast(page.getByText(initials, { exact: true }).first()), initials).toBeGreaterThanOrEqual(4.5);
  }
});

test('an item added after Edit package gets its own photos', async ({ page }) => {
  await walkTo(page, 'diaspora', 'post');
  await item(page, 2).getByLabel('Add photo for Medicine').setInputFiles(PHOTO);
  await page.getByRole('button', { name: 'Remove item 1' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Find travelers' }).click();
  await page.getByRole('button', { name: 'Edit package' }).click();
  await page.getByRole('button', { name: 'Add another item' }).click();
  await expect(item(page, 2).getByRole('img', { name: /^Photo/ })).toHaveCount(1);
});

test('"Back to my package" returns to the current step from a tab', async ({ page }) => {
  await walkTo(page, 'diaspora', 'matches');
  const tabs = page.getByRole('navigation', { name: 'Tabs' });
  await tabs.getByRole('button', { name: 'Profile', exact: true }).click();
  await tabs.getByRole('button', { name: 'New' }).click();
  await page.getByRole('button', { name: 'Back to my package' }).click();
  await expect(page.getByRole('heading', { name: 'Available Travelers' })).toBeVisible();
});

test('the one-package sheet closes when the phones switch', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'the banner switch is the phone layout');
  await walkTo(page, 'diaspora', 'offerSent');
  await page.getByRole('navigation', { name: 'Tabs' }).getByRole('button', { name: 'New' }).click();
  await expect(page.getByRole('dialog', { name: 'One package at a time in the demo' })).toBeVisible();
  await page.getByRole('button', { name: /^Switch to Dawit/ }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Accept' })).toBeVisible();
});
