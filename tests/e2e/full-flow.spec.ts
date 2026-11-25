import { expect, test, type Page } from '@playwright/test';
import { nextStep, pickStory } from './helpers';

interface Case {
  story: 'Diaspora' | 'Domestic';
  sender: string;
  traveler: string;
  total: string;
  payout: string;
}

const CASES: Case[] = [
  { story: 'Diaspora', sender: 'Selam', traveler: 'Dawit', total: '$71.28', payout: 'Dawit receives $60.00 · Yizzo fee $6.00' },
  { story: 'Domestic', sender: 'Meron', traveler: 'Abebe', total: '713 ETB', payout: 'Abebe receives 600 ETB · Yizzo fee 60 ETB' },
];

const tap = (page: Page, name: string | RegExp) => page.getByRole('button', { name }).click();

for (const c of CASES) {
  test(`${c.story}: the whole delivery, start to done`, async ({ page }) => {
    await page.goto('/');
    await pickStory(page, c.story === 'Diaspora' ? 'diaspora' : 'domestic');

    // Account
    await tap(page, 'Create account');
    await tap(page, 'Verify with Fayda');
    await expect(page.getByRole('dialog', { name: 'Demo — simulated Fayda sign-in' })).toBeVisible();
    await tap(page, 'Allow');
    await tap(page, 'Continue');
    await tap(page, 'Fill code');
    await tap(page, 'Confirm');
    await expect(page.getByText('Your account is active')).toBeVisible();
    await tap(page, 'Continue');

    // Package and matches
    await tap(page, /^Send an Item/);
    await tap(page, 'Next');
    await tap(page, 'Next');
    await tap(page, 'Find travelers');
    const cards = page.getByRole('article');
    await expect(cards).toHaveCount(3);
    await expect(cards.first()).toContainText(c.traveler);
    await cards.first().getByRole('button', { name: 'Send offer' }).click();

    // The traveler accepts; the sender confirms and pays
    await tap(page, `Traveler · ${c.traveler}`);
    await tap(page, 'Accept');
    await tap(page, `Sender · ${c.sender}`);
    await tap(page, `Confirm ${c.traveler}`);
    await tap(page, `Pay ${c.total} into escrow`);
    await expect(page.getByText('Held', { exact: true })).toBeVisible();

    // A message on the way
    await tap(page, `Message ${c.traveler}`);
    await page.getByRole('textbox', { name: 'Write a message' }).fill('Thank you!');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(page.getByRole('log', { name: 'Messages' })).toContainText('Thank you!');
    await tap(page, 'Back');

    // Delivery
    await tap(page, `Traveler · ${c.traveler}`);
    await tap(page, 'Mark picked up');
    await tap(page, 'Mark in transit');
    await tap(page, 'Mark delivered');
    await tap(page, `Sender · ${c.sender}`);
    await tap(page, 'Confirm delivery');
    await expect(page.getByText('Released', { exact: true })).toBeVisible();
    await expect(page.getByText(c.payout)).toBeVisible();

    // Ratings, both ways
    await page.getByRole('radio', { name: '5 stars' }).click();
    await tap(page, 'Submit rating');
    await expect(page.getByText(`Your rating is hidden until ${c.traveler} rates too.`)).toBeVisible();
    await tap(page, `Traveler · ${c.traveler}`);
    await page.getByRole('radio', { name: '4 stars' }).click();
    await tap(page, 'Submit rating');
    await expect(page.getByRole('img', { name: '5 out of 5 stars' })).toBeVisible();
    await expect(page.getByRole('img', { name: '4 out of 5 stars' })).toBeVisible();
    await tap(page, 'See summary');

    await expect(page.getByRole('heading', { name: "That's one delivery", level: 1 })).toBeVisible();
    await expect(page.getByText(`She paid ${c.total} into escrow.`)).toBeVisible();
    await expect(nextStep(page)).toHaveText('Try the other story, or start over.');
  });
}

test('restart partway clears the delivery', async ({ page }) => {
  await page.goto('/');
  await pickStory(page, 'diaspora');
  await tap(page, 'Create account');
  await tap(page, 'Verify with Fayda');
  await tap(page, 'Allow');
  await tap(page, 'Continue');
  await tap(page, 'Fill code');
  await tap(page, 'Confirm');
  await tap(page, 'Continue');
  await tap(page, /^Send an Item/);
  await tap(page, 'Next');
  await tap(page, 'Next');
  await tap(page, 'Find travelers');
  await page.getByRole('article').first().getByRole('button', { name: 'Send offer' }).click();
  await tap(page, 'Message Dawit');
  await page.getByRole('textbox', { name: 'Write a message' }).fill('Before the restart');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await tap(page, 'Back');

  // Restart, then the same story again up to the chat
  await page.getByRole('button', { name: 'Restart demo' }).filter({ visible: true }).click();
  await pickStory(page, 'diaspora');
  await expect(page.getByLabel('Full name')).toHaveValue('Selam Tesfaye');
  await tap(page, 'Create account');
  await tap(page, 'Verify with Fayda');
  await tap(page, 'Allow');
  await tap(page, 'Continue');
  await tap(page, 'Fill code');
  await tap(page, 'Confirm');
  await tap(page, 'Continue');
  await expect(page.getByRole('button', { name: /^Message / })).toHaveCount(0);
  await tap(page, /^Send an Item/);
  await tap(page, 'Next');
  await tap(page, 'Next');
  await tap(page, 'Find travelers');
  await expect(page.getByText('Offer sent')).toHaveCount(0);
  await page.getByRole('article').first().getByRole('button', { name: 'Send offer' }).click();
  await tap(page, 'Message Dawit');

  const thread = page.getByRole('log', { name: 'Messages' });
  await expect(thread.getByRole('paragraph')).toHaveCount(2);
  await expect(thread).not.toContainText('Before the restart');
});
