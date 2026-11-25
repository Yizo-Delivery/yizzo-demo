import { expect, test, type Page } from '@playwright/test';
import { nextStep, walkTo } from './helpers';

const toTraveler = (page: Page) => page.getByRole('button', { name: /^Traveler ·/ }).click();
const toSender = (page: Page) => page.getByRole('button', { name: /^Sender ·/ }).click();
const rate = async (page: Page, stars: number, review?: string) => {
  await page.getByRole('radio', { name: `${stars} star${stars === 1 ? '' : 's'}` }).click();
  if (review) await page.getByLabel('Review (optional)').fill(review);
  await page.getByRole('button', { name: 'Submit rating' }).click();
};

test('traveler delivers, sender confirms, money is released', async ({ page }) => {
  await walkTo(page, 'diaspora', 'paid');
  await toTraveler(page);
  const timeline = page.getByRole('list', { name: 'Delivery progress' });
  await expect(timeline).toBeVisible();

  await page.getByRole('button', { name: 'Mark picked up' }).click();
  await page.getByRole('button', { name: 'Mark in transit' }).click();
  await page.getByRole('button', { name: 'Mark delivered' }).click();
  await expect(page.getByText('Waiting for Selam to confirm delivery')).toBeVisible();
  await expect(nextStep(page)).toHaveText('Switch to Selam, then tap Confirm delivery.');

  await toSender(page);
  await expect(page.getByText('Held', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Confirm delivery' }).click();
  await expect(page.getByText('Released', { exact: true })).toBeVisible();
  await expect(page.getByText('Dawit receives $60.00 · Yizzo fee $6.00')).toBeVisible();
});

test('the sender cannot confirm before the package is delivered', async ({ page }) => {
  await walkTo(page, 'diaspora', 'inTransit');
  await toSender(page);
  await expect(page.getByRole('button', { name: 'Confirm delivery' })).toHaveCount(0);
  await expect(page.getByText('Held', { exact: true })).toBeVisible();
});

test('ratings are hidden until both have rated', async ({ page }) => {
  await walkTo(page, 'diaspora', 'released');
  await expect(page.getByRole('button', { name: 'Submit rating' })).toBeDisabled();
  await rate(page, 5, 'Smooth and on time');
  await expect(page.getByText('Your rating is hidden until Dawit rates too.')).toBeVisible();

  await toTraveler(page);
  await expect(page.getByText('You receive $60.00')).toBeVisible();
  await expect(page.getByText('Smooth and on time')).toHaveCount(0);
  await rate(page, 4);

  await expect(page.getByText('Smooth and on time')).toBeVisible();
  await expect(page.getByRole('img', { name: '4 out of 5 stars' })).toBeVisible();
  await page.getByRole('button', { name: 'See summary' }).click();
  await expect(page.getByRole('heading', { name: "That's one delivery", level: 1 })).toBeVisible();
});

test('the done screen offers the other story', async ({ page }) => {
  await walkTo(page, 'diaspora', 'done');
  await expect(page.getByText('Disputes freeze the escrow')).toBeVisible();
  // Honest about what exists: admin tools are an API for now, and Fayda is simulated here
  await expect(page.getByText('Admin tools (an API for now), with an audit log of every admin action.')).toBeVisible();
  await expect(page.getByText(/with Fayda \(simulated here\)/)).toBeVisible();
  await page.getByRole('button', { name: 'Try the other story' }).click();
  await expect(page.getByLabel('Full name')).toHaveValue('Meron Haile');
});

test('Start over on the done screen returns to the start', async ({ page }) => {
  await walkTo(page, 'domestic', 'done');
  await page.getByRole('button', { name: 'Start over' }).click();
  await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
});

test('domestic release pays in birr', async ({ page }) => {
  await walkTo(page, 'domestic', 'released');
  await expect(page.getByText('Abebe receives 600 ETB · Yizzo fee 60 ETB')).toBeVisible();
});
