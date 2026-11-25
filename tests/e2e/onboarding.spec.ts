import { expect, test } from '@playwright/test';
import { nextStep, walkTo } from './helpers';

test('signs up, verifies with the simulated Fayda, confirms the phone', async ({ page }) => {
  await walkTo(page, 'diaspora', 'signup');
  await page.getByRole('button', { name: 'Create account' }).click();

  await page.getByRole('button', { name: 'Verify with Fayda' }).click();
  await page.getByRole('button', { name: 'Allow' }).click();
  await expect(page.getByText('Verified identity')).toBeVisible();
  await expect(page.getByText('One more step: confirm your phone.')).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByText('We texted a code to +251 9•• ••• 12')).toBeVisible();
  await page.getByLabel('Code').fill('482913');
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByText('Your account is active')).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(nextStep(page)).toHaveText('Tap Send an Item.');
  // Active: the sender/traveler switch appears
  await expect(page.getByRole('button', { name: 'Traveler · Dawit' })).toBeVisible();
});

test('the Fayda sheet is labeled as a demo', async ({ page }) => {
  await walkTo(page, 'diaspora', 'verify');
  await page.getByRole('button', { name: 'Verify with Fayda' }).click();
  const sheet = page.getByRole('dialog', { name: 'Demo — simulated Fayda sign-in' });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByText('Phone number')).toBeVisible();
});

test('cancelling the Fayda sheet leaves you unverified', async ({ page }) => {
  await walkTo(page, 'diaspora', 'verify');
  await page.getByRole('button', { name: 'Verify with Fayda' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText('Verified identity')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Verify with Fayda' })).toBeVisible();
});

test('a wrong code shows an error and stays', async ({ page }) => {
  await walkTo(page, 'diaspora', 'phone');
  await page.getByLabel('Code').fill('000000');
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByText("That code isn't right")).toBeVisible();
  await expect(page.getByLabel('Code')).toBeVisible();

  await page.getByRole('button', { name: 'Fill code' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByText('Your account is active')).toBeVisible();
});

test('Confirm needs six digits', async ({ page }) => {
  await walkTo(page, 'domestic', 'phone');
  await expect(page.getByText('We texted a code to +251 9•• ••• 47')).toBeVisible();
  await page.getByLabel('Code').fill('48');
  await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled();
});

test('walkTo reaches the package form in the domestic story', async ({ page }) => {
  await walkTo(page, 'domestic', 'post');
  await expect(page.getByRole('button', { name: 'Traveler · Abebe' })).toBeVisible();
});
