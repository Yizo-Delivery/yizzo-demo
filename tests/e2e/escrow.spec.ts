import { expect, test } from '@playwright/test';
import { nextStep, walkTo } from './helpers';

const toTraveler = (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: /^Traveler ·/ }).click();
const toSender = (page: import('@playwright/test').Page) => page.getByRole('button', { name: /^Sender ·/ }).click();

test('the traveler sees their trip and no offers before one is sent', async ({ page }) => {
  await walkTo(page, 'diaspora', 'post');
  await toTraveler(page);
  await expect(page.getByText('No offers yet')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your trips' })).toBeVisible();
  await expect(page.getByText('Washington, DC → Addis Ababa')).toBeVisible();
  await expect(page.getByText('10 kg capacity')).toBeVisible();
});

test('traveler accepts, sender confirms and pays', async ({ page }) => {
  await walkTo(page, 'diaspora', 'offerSent');
  await toTraveler(page);

  const offer = page.getByRole('article', { name: 'Offer from Selam Tesfaye' });
  await expect(offer).toContainText('Laptop');
  await expect(offer).toContainText('3 kg');
  await expect(offer).toContainText('$60.00');
  await offer.getByRole('button', { name: 'Accept' }).click();
  await expect(page.getByText('Waiting for Selam to confirm')).toBeVisible();
  await expect(nextStep(page)).toHaveText('Switch to Selam, then confirm Dawit.');

  await toSender(page);
  await expect(page.getByText('Dawit accepted your offer')).toBeVisible();
  await page.getByRole('button', { name: 'Confirm Dawit' }).click();

  const breakdown = page.getByRole('table', { name: 'Payment' });
  await expect(breakdown.getByRole('row', { name: /Reward/ })).toContainText('$60.00');
  await expect(breakdown.getByRole('row', { name: /Yizzo fee \(10%\)/ })).toContainText('$6.00');
  await expect(breakdown.getByRole('row', { name: /Tax \(8%\)/ })).toContainText('$5.28');
  await expect(breakdown.getByRole('row', { name: /Total/ })).toContainText('$71.28');

  await page.getByRole('button', { name: 'Pay $71.28 into escrow' }).click();
  await expect(page.getByText('Held', { exact: true })).toBeVisible();
  await expect(page.getByText('Yizzo keeps the money until you confirm delivery.')).toBeVisible();
});

test('domestic shows birr', async ({ page }) => {
  await walkTo(page, 'domestic', 'confirmed');
  await expect(page.getByRole('button', { name: 'Pay 713 ETB into escrow' })).toBeVisible();
});

test('double-tapping Pay charges once', async ({ page }) => {
  await walkTo(page, 'diaspora', 'confirmed');
  await page.getByRole('button', { name: /into escrow/ }).dblclick();
  await expect(page.getByText('Held', { exact: true })).toHaveCount(1);
  await expect(page.getByRole('table', { name: 'Payment' }).getByRole('row', { name: /Total/ })).toContainText(
    '$71.28',
  );
});

test('a posted trip appears in Your trips', async ({ page }) => {
  await walkTo(page, 'diaspora', 'post');
  await toTraveler(page);
  await page.getByRole('button', { name: 'Post a trip' }).click();

  await expect(page.getByLabel('From')).toHaveValue('Washington, DC');
  await page.getByLabel('Space for packages (kg)').fill('15');
  await page.getByRole('button', { name: 'Save trip' }).click();

  await expect(page.getByText('15 kg capacity')).toBeVisible();
  await expect(page.getByText('10 kg capacity')).toBeVisible();
});

test('the trip form refuses bad values and can be cancelled', async ({ page }) => {
  await walkTo(page, 'diaspora', 'post');
  await toTraveler(page);
  await page.getByRole('button', { name: 'Post a trip' }).click();

  await page.getByLabel('Space for packages (kg)').fill('0');
  await expect(page.getByRole('button', { name: 'Save trip' })).toBeDisabled();
  await page.getByLabel('Space for packages (kg)').fill('10');
  await page.getByLabel('Arrive').fill('2026-01-01');
  await expect(page.getByText('Arrival must be on or after departure')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save trip' })).toBeDisabled();

  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('heading', { name: 'Your trips' })).toBeVisible();
});
