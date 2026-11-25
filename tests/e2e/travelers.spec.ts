import { expect, test } from '@playwright/test';
import { walkTo } from './helpers';

test('the header shows the route, dates and the real count', async ({ page }) => {
  await walkTo(page, 'diaspora', 'matches');
  await expect(page.getByText('Washington, DC → Addis Ababa')).toBeVisible();
  await expect(page.getByText('3 travelers for your package')).toBeVisible();
  await expect(page.getByText(/\d+ travelers available/)).toHaveCount(0);
});

test('diaspora cards show airports', async ({ page }) => {
  await walkTo(page, 'diaspora', 'matches');
  const first = page.getByRole('article').first();
  for (const text of ['IAD → ADD', 'Best match', 'Verified', '23 reviews', '8 kg free']) {
    await expect(first).toContainText(text);
  }
});

test('domestic travelers show by car, not airports', async ({ page }) => {
  await walkTo(page, 'domestic', 'matches');
  const first = page.getByRole('article').first();
  await expect(first).toContainText('by car');
  await expect(first).not.toContainText(/[A-Z]{3} → [A-Z]{3}/);
});

test('there is no filter button', async ({ page }) => {
  await walkTo(page, 'diaspora', 'matches');
  await expect(page.getByRole('button', { name: /filter/i })).toHaveCount(0);
});
