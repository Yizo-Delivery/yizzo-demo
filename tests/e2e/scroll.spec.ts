import { expect, test, type Page } from '@playwright/test';
import { walkTo } from './helpers';

// On a phone the page scrolls; in the laptop frame the app's <main> does.
const scrolled = (page: Page) =>
  page.evaluate(() => window.scrollY + (document.querySelector('main')?.scrollTop ?? 0));

const scrollToBottom = (page: Page) =>
  page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
    const main = document.querySelector('main');
    main?.scrollTo(0, main.scrollHeight);
  });

test('a new screen opens at the top', async ({ page }) => {
  await walkTo(page, 'diaspora', 'post');
  await scrollToBottom(page);
  expect(await scrolled(page)).toBeGreaterThan(0);

  await page.getByRole('button', { name: 'Find travelers' }).click();
  await expect(page.getByRole('heading', { name: 'Travelers for your package' })).toBeVisible();
  await expect.poll(() => scrolled(page)).toBe(0);
});
