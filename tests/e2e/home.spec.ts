import { expect, test } from '@playwright/test';
import { nextStep, pickStory, walkTo } from './helpers';

test('home greets the sender by first name', async ({ page }) => {
  await walkTo(page, 'diaspora', 'home');
  await expect(page.getByRole('heading', { name: 'Hi, Selam' })).toBeVisible();
});

test('Send an Item starts the form', async ({ page }) => {
  await walkTo(page, 'diaspora', 'home');
  await page.getByRole('button', { name: /^Send an Item/ }).click();
  await expect(nextStep(page)).toHaveText('Check the item, tap Next twice, then Find travelers.');
  await expect(page.getByRole('list', { name: 'Steps' }).locator('[aria-current="step"]')).toContainText('Item details');
});

test("Traveling Soon? switches to the traveler's phone", async ({ page }) => {
  await walkTo(page, 'diaspora', 'home');
  await page.getByRole('button', { name: /^Traveling Soon\?/ }).click();
  await expect(page.getByRole('button', { name: /^Traveler ·/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Post a trip' })).toBeVisible();
});

test('popular routes show 50+ active travelers next to Sample data', async ({ page }) => {
  await walkTo(page, 'diaspora', 'home');
  const routes = page.getByRole('region', { name: 'Popular routes' });
  await expect(routes.getByText('Sample data')).toBeVisible();
  const rows = routes.getByRole('listitem');
  await expect(rows).toHaveCount(3);
  for (const country of ['USA', 'UK', 'Canada']) await expect(routes).toContainText(country);
  for (let i = 0; i < 3; i++) await expect(rows.nth(i)).toContainText('50+ active travelers');
});

test('domestic home lists Ethiopian routes', async ({ page }) => {
  await walkTo(page, 'domestic', 'home');
  const routes = page.getByRole('region', { name: 'Popular routes' });
  for (const city of ['Hawassa', 'Bahir Dar', 'Dire Dawa']) await expect(routes).toContainText(city);
  await expect(routes).not.toContainText('USA');
});

test('How Yizzo Works has four steps', async ({ page }) => {
  await walkTo(page, 'diaspora', 'home');
  await expect(page.getByRole('region', { name: 'How Yizzo Works' }).getByRole('listitem')).toHaveCount(4);
});

test('route rows are not buttons', async ({ page }) => {
  await walkTo(page, 'diaspora', 'home');
  await expect(page.getByRole('region', { name: 'Popular routes' }).getByRole('button')).toHaveCount(0);
});

test("a long name doesn't overflow Home", async ({ page }) => {
  await page.goto('/');
  await pickStory(page, 'diaspora');
  await page.getByLabel('Full name').fill('A'.repeat(60));
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.getByRole('button', { name: 'Verify with Fayda' }).click();
  await page.getByRole('button', { name: 'Allow' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Fill code' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: /^Hi, A+$/ })).toBeVisible();
  const page_ = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(page_).toBeLessThanOrEqual(0);
  const main = await page.locator('main').evaluate((m) => m.scrollWidth - m.clientWidth);
  expect(main).toBeLessThanOrEqual(0);
});
