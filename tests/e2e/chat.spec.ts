import { expect, test, type Page } from '@playwright/test';
import { walkTo } from './helpers';

const openChat = (page: Page) => page.getByRole('button', { name: /^Message / }).click();
const composer = (page: Page) => page.getByRole('textbox', { name: 'Write a message' });
const send = (page: Page) => page.getByRole('button', { name: 'Send', exact: true });
const thread = (page: Page) => page.getByRole('log', { name: 'Messages' });

test('there is no chat before an offer is sent', async ({ page }) => {
  await walkTo(page, 'diaspora', 'matches');
  await expect(page.getByRole('button', { name: /^Message / })).toHaveCount(0);
});

test('chat opens with the seeded conversation', async ({ page }) => {
  await walkTo(page, 'diaspora', 'offerSent');
  await expect(page.getByRole('button', { name: 'Message Dawit' })).toBeVisible();
  await openChat(page);
  await expect(page.getByRole('heading', { name: 'Dawit Bekele' })).toBeVisible();
  await expect(thread(page)).toContainText('Hi Selam! Happy to carry this for you.');
  await expect(thread(page)).toContainText('Great. My mom can meet you near Bole when you land.');
});

test('a sent message shows in the other view', async ({ page }) => {
  await walkTo(page, 'diaspora', 'paid');
  await openChat(page);
  await composer(page).fill('See you there');
  await send(page).click();
  await expect(composer(page)).toHaveValue('');
  await expect(thread(page)).toContainText('See you there');

  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('button', { name: /^Traveler ·/ }).click();
  await page.getByRole('button', { name: 'Message Selam' }).click();
  await expect(page.getByRole('heading', { name: 'Selam Tesfaye' })).toBeVisible();
  await expect(thread(page)).toContainText('See you there');
});

test('the canned reply arrives once', async ({ page }) => {
  await walkTo(page, 'diaspora', 'paid');
  await openChat(page);
  await composer(page).fill('First');
  await send(page).click();
  await expect(thread(page).getByText("Sure, Bole works. I'll message when I land.")).toHaveCount(1);
  await composer(page).fill('Second');
  await composer(page).press('Enter');
  await expect(thread(page)).toContainText('Second');
  await expect(thread(page).getByText("Sure, Bole works. I'll message when I land.")).toHaveCount(1);
});

test('Send is disabled for spaces only', async ({ page }) => {
  await walkTo(page, 'domestic', 'offerSent');
  await openChat(page);
  await composer(page).fill('    ');
  await expect(send(page)).toBeDisabled();
  await composer(page).fill('Hello');
  await expect(send(page)).toBeEnabled();
});
