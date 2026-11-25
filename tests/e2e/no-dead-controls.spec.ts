import { expect, test, type Page } from '@playwright/test';
import { walkTo } from './helpers';
import type { Step } from '../../src/demo/types';

// Every visible control must do something: change the screen, the phones or open a dialog.
// Laptop only: the phone layout has the same app, and each tap needs a fresh walk.

const controls = (page: Page) =>
  page.locator('main button:visible, nav[aria-label="Tabs"] button:visible').filter({ hasNot: page.locator('[disabled]') });

/** What a tap could change: the app's screen, the tabs, whose phone is shown, or a dialog */
const snapshot = (page: Page) =>
  page.evaluate(() =>
    [
      document.querySelector('main')?.innerHTML,
      document.querySelector('nav[aria-label="Tabs"]')?.innerHTML ?? '',
      document.querySelector('header')?.innerHTML ?? '',
      document.querySelectorAll('[role="dialog"]').length,
    ].join('|'),
  );

for (const step of ['home', 'matches', 'paid', 'done'] as Step[]) {
  test(`no control does nothing (${step})`, async ({ page, isMobile }) => {
    test.skip(isMobile, 'laptop covers the same app');
    test.setTimeout(240_000);
    await walkTo(page, 'diaspora', step);
    await expect(controls(page).first()).toBeEnabled();
    const names = new Set<string>();
    for (const el of await controls(page).all()) {
      if ((await el.getAttribute('aria-current')) === 'page') continue; // the tab you're on
      const name = ((await el.getAttribute('aria-label')) ?? (await el.innerText()).split('\n')[0]).trim();
      if (name && name !== 'Restart demo') names.add(name);
    }
    expect(names.size).toBeGreaterThan(0);

    for (const name of names) {
      await walkTo(page, 'diaspora', step);
      const target = controls(page).filter({ hasText: name }).or(controls(page).and(page.getByLabel(name, { exact: true }))).first();
      await expect(target, name).toBeEnabled();
      const before = await snapshot(page);
      await target.click();
      await expect.poll(() => snapshot(page), { message: `"${name}" at ${step} did nothing`, timeout: 3000 }).not.toBe(before);
    }
  });
}
