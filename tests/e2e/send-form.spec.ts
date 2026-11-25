import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';
import { continueTo, pickStory, walkTo } from './helpers';

const item = (page: Page, n: number) => page.getByRole('group', { name: `Item ${n}` });
const current = (page: Page) => page.getByRole('list', { name: 'Steps' }).locator('[aria-current="step"]');
const PHOTO = path.join(__dirname, 'fixtures', 'photo.png');

test('the stepper walks Item details → Preferences → Review', async ({ page }) => {
  await walkTo(page, 'diaspora', 'post');
  await expect(current(page)).toContainText('Item details');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(current(page)).toContainText('Preferences');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(current(page)).toContainText('Review');
  await expect(page.getByText('Laptop')).toBeVisible();
  await expect(page.getByText('Medicine')).toBeVisible();
  await expect(page.getByText('Yizzo fee (10%)')).toBeVisible();
  await expect(page.getByText('Tax (8%)')).toBeVisible();
  await page.getByRole('button', { name: 'Find travelers' }).click();
  await expect(page.getByRole('article').first()).toBeVisible();
});

test('Back keeps entered values', async ({ page }) => {
  await walkTo(page, 'diaspora', 'post');
  await item(page, 1).getByLabel('Item name').fill('Gift');
  await item(page, 1).getByLabel('Weight (kg)').fill('1.5');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(item(page, 1).getByLabel('Item name')).toHaveValue('Gift');
  await expect(item(page, 1).getByLabel('Weight (kg)')).toHaveValue('1.5');
});

test('an invalid weight stops Next on Item details', async ({ page }) => {
  await walkTo(page, 'diaspora', 'post');
  await item(page, 1).getByLabel('Weight (kg)').fill('0');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Enter a weight between 0.1 and 30 kg')).toBeVisible();
  await expect(current(page)).toContainText('Item details');
});

test('switching phones keeps the step and values', async ({ page }) => {
  await walkTo(page, 'diaspora', 'post');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel('Reward (USD)').fill('75');
  await page.getByRole('button', { name: /^Traveler ·/ }).click();
  await page.getByRole('button', { name: /^Sender ·/ }).click();
  await expect(current(page)).toContainText('Preferences');
  await expect(page.getByLabel('Reward (USD)')).toHaveValue('75');
});

test('a picked photo survives edit and clears on restart', async ({ page }) => {
  await walkTo(page, 'diaspora', 'post');
  const photos = item(page, 1).getByRole('img', { name: /^Photo/ });
  await expect(photos).toHaveCount(1);
  await item(page, 1).getByLabel('Add photo for Laptop').setInputFiles(PHOTO);
  await expect(photos).toHaveCount(2);

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Find travelers' }).click();
  await page.getByRole('button', { name: 'Edit package' }).click();
  await expect(photos).toHaveCount(2);

  await page.getByRole('button', { name: 'Restart demo' }).filter({ visible: true }).click();
  await pickStory(page, 'diaspora');
  await continueTo(page, 'post');
  await expect(photos).toHaveCount(1);
});

test('a third picked photo is refused', async ({ page }) => {
  await walkTo(page, 'diaspora', 'post');
  const add = item(page, 1).getByLabel('Add photo for Laptop');
  await add.setInputFiles(PHOTO);
  await add.setInputFiles(PHOTO);
  await expect(item(page, 1).getByRole('img', { name: /^Photo/ })).toHaveCount(3);
  await expect(add).toHaveCount(0);
  await expect(item(page, 1).getByText('Up to 3 photos')).toBeVisible();
});
