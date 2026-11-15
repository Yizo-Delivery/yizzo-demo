import { expect, test } from '@playwright/test';

test('start screen shows the wordmark, both stories and the sample-data note', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Yizzo', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Diaspora/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Domestic/ })).toBeVisible();
  await expect(page.getByText('Demo with sample data')).toBeVisible();
});
