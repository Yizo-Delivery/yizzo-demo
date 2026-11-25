import { expect, test, type Page } from '@playwright/test';
import { nextStep, walkTo } from './helpers';

const item = (page: Page, n: number) => page.getByRole('group', { name: `Item ${n}` });
const cards = (page: Page) => page.getByRole('article');

test('the form is prefilled and shows the total weight', async ({ page }) => {
  await walkTo(page, 'diaspora', 'post');
  await expect(item(page, 1).getByLabel('Item name')).toHaveValue('Laptop');
  await expect(item(page, 2).getByLabel('Weight (kg)')).toHaveValue('0.8');
  await expect(item(page, 1).getByLabel('Item value (USD)')).toHaveValue('450');
  await expect(page.getByText('Total weight: 3 kg')).toBeVisible();

  await item(page, 1).getByLabel('Weight (kg)').fill('4.2');
  await expect(page.getByText('Total weight: 5 kg')).toBeVisible();

  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByLabel('Reward (USD)')).toHaveValue('60');
  await expect(page.getByText('Washington, DC → Addis Ababa')).toBeVisible();
});

test('shows three ranked travelers with Dawit first', async ({ page }) => {
  await walkTo(page, 'diaspora', 'matches');
  await expect(cards(page)).toHaveCount(3);
  await expect(cards(page).first()).toContainText('Dawit Bekele');
  await expect(cards(page).first()).toContainText('Best match');
  await expect(cards(page).first()).toContainText('Verified');
  await expect(cards(page).first()).toContainText('8 kg free');
  await expect(cards(page).nth(1)).toContainText('Hirut Alemu');
  await expect(cards(page).nth(2)).toContainText('Yonas Girma');
});

test('no room → edit package', async ({ page }) => {
  await walkTo(page, 'diaspora', 'post');
  await item(page, 1).getByLabel('Weight (kg)').fill('30');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Find travelers' }).click();

  await expect(page.getByText('No traveler has room for 30.8 kg on this route yet.')).toBeVisible();
  await expect(cards(page)).toHaveCount(0);
  await page.getByRole('button', { name: 'Edit package' }).click();
  await expect(item(page, 1).getByLabel('Weight (kg)')).toHaveValue('30');
});

test('an empty name stops Next, and an empty reward stops Preferences', async ({ page }) => {
  await walkTo(page, 'diaspora', 'post');
  await item(page, 2).getByLabel('Item name').fill('');
  await expect(page.getByText('Name each item')).toBeVisible();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(item(page, 2)).toBeVisible();
  await item(page, 2).getByLabel('Item name').fill('Medicine');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel('Reward (USD)').fill('');
  await expect(page.getByText('Enter a reward')).toBeVisible();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByLabel('Reward (USD)')).toBeVisible();
});

test('items can be added up to three and removed down to one', async ({ page }) => {
  await walkTo(page, 'diaspora', 'post');
  await page.getByRole('button', { name: 'Add another item' }).click();
  await expect(item(page, 3)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add another item' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Remove item 3' }).click();
  await page.getByRole('button', { name: 'Remove item 2' }).click();
  await expect(page.getByRole('button', { name: /Remove item/ })).toHaveCount(0);
  await expect(page.getByText('Total weight: 2.2 kg')).toBeVisible();
});

test('sending an offer shows Offer sent', async ({ page }) => {
  await walkTo(page, 'diaspora', 'matches');
  await cards(page).first().getByRole('button', { name: 'Send offer' }).click();
  await expect(cards(page).first().getByText('Offer sent')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send offer' })).toHaveCount(0);
  await expect(nextStep(page)).toHaveText('Switch to Dawit, then tap Accept.');
});

test('the domestic story prices in birr and puts Abebe first', async ({ page }) => {
  await walkTo(page, 'domestic', 'matches');
  await expect(cards(page).first()).toContainText('Abebe Tadesse');
  await expect(page.getByText('Addis Ababa → Hawassa')).toBeVisible();
});
