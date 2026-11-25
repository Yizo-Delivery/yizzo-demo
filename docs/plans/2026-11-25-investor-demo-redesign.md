# Investor Demo Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the live Yizzo demo the reference's navy and light-blue look, and add Welcome, Home, a bottom tab bar, a 3-step Send an Item form and restyled Available Travelers, while the guided delivery keeps working in both stories.

**Architecture:** The pure reducer in `src/demo/reducer.ts` gains one step (`home`), one action (`startSend`) and three tab panels. Everything else is presentational:
- shared building blocks in `src/components/`;
- one screen per file in `src/screens/`;
- photos the investor picks live in a provider-level store outside the reducer.

The existing Playwright route helper (`tests/e2e/helpers.ts`) is updated first, so every later task keeps the whole suite green.

**Tech Stack:** Next.js 16.4.6 (static export), React 19.3, Tailwind 4.3, TypeScript, lucide-react, Vitest 5, Playwright 1.65.

**Spec:** `docs/specs/2026-11-25-investor-demo-redesign-design.md`. It builds on `docs/specs/2026-11-15-investor-demo-design.md`.

## Global Constraints

- **Branch:** work on `feat/redesign` in `/Users/mw/yizzo-demo`, never on `main`. Push only when the user asks. Pushing `main` updates the live investor link.
- **Commits:** conventional messages, with **no Co-Authored-By trailer** (the user's rule). Commit at each task's commit step only if the user has OK'd commits for this build; ask once at the start of execution.
- **Colors:** keep the token names and replace their values:
  - `brand` ≈ `#0B1F4B` (navy);
  - `brand-soft` ≈ `#E8F0FE` (light blue);
  - new `sky` ≈ `#3B82F6`;
  - `accent` stays gold and is for stars only;
  - `held`, `released` and `sent` are unchanged.
- **Colors and text:** light blue is never used as a text color on white. Contrast must pass WCAG AA.
- **Font:** Plus Jakarta Sans via `next/font/google`, replacing Inter.
- **Tagline (exact):** "People move the world closer."
- **Crowd number (exact):** "50+ active travelers", always next to a visible "Sample data" label. The travelers list says "{n} travelers for your package", where n is the real count.
- **Photos of people:** none, except the user's licensed stock photo at `public/welcome.jpg`. Until it exists, show a navy gradient. Travelers and senders get initials avatars.
- **No dead controls:**
  - no filter button;
  - no "I already have an account";
  - every visible button or tab changes the screen or the state.
- **Flags:** inline SVG for USA, UK, Canada and Ethiopia (never emoji), `aria-hidden`, with the country written out next to each.
- **Tap targets and focus:**
  - tap targets are at least 44 px;
  - buttons keep `disabled` while arming (ARM_MS = 350); the e2e tests depend on it;
  - a new screen still focuses its h1.
- **Nothing loads from outside at runtime.** Item illustrations live in `public/items/`, with their source noted in `public/items/README.md`.
- **Verification commands:**
  - `npm test` (Vitest);
  - `npx tsc --noEmit`;
  - `npm run lint`;
  - `npm run build`;
  - `npx playwright test` (it builds and serves `out` on port 3100).

  Long e2e runs go to a file: `npx playwright test > /tmp/e2e.log 2>&1; tail -30 /tmp/e2e.log`.

## Review Focus

1. **Switching phones in the middle of the Send form.** The investor fills in step 2, switches to the traveler and comes back. They should be on step 2 with their values intact. Test: Task 5, `send-form.spec.ts` "switching phones keeps the step and values".
2. **A picked photo after Find travelers → Edit package, and after Restart.** The photo should still be there after Edit package and gone after Restart. Test: Task 5, "a picked photo survives edit and clears on restart".
3. **A tab panel open while the guide says to switch phones.** Tapping the banner should switch and close the panel. The guide says "Tap Home to continue" while a tab panel is open. Tests: Task 1 unit `switchView closes a tab panel`, and Task 7 e2e "banner switch closes a tab panel".
4. **A very long sign-up name (60 characters, no spaces).** "Hi, {first name}" on Home and the Profile name should wrap or truncate with no sideways scroll. Test: Task 4, "a long name doesn't overflow Home".
5. **The domestic story everywhere.** Home shows Ethiopian routes (no USA, UK or Canada flags). Cards say "by car" and show no airport codes. Test: Task 6, "domestic travelers show by car, not airports", and Task 4, "domestic home lists Ethiopian routes".

---

### Task 0: Branch

- [ ] **Step 1:** `cd /Users/mw/yizzo-demo && git switch -c feat/redesign` (the working tree must be clean). Expected: `Switched to a new branch 'feat/redesign'`.
- [ ] **Step 2:** Baseline. Run `npm test && npx playwright test > /tmp/e2e.log 2>&1; tail -5 /tmp/e2e.log`. Expected: 41 unit tests pass; e2e shows 107 passed and 1 skipped.

### Task 1: State: `home` step, tab panels, item fields, guide, minimal Home

**Files:**
- Modify: `src/demo/types.ts`, `src/demo/reducer.ts`, `src/demo/guide.ts`, `src/demo/matching.ts`, `src/demo/stories.ts`, `src/components/ViewSwitch.tsx`, `src/components/DemoLayout.tsx` (the `switchTo` gate), `src/screens/ScreenRouter.tsx`
- Create: `src/screens/HomeScreen.tsx` (minimal: h1 "Hi, {first name}" plus a "Send an Item" button; Task 4 fills it in)
- Test: `tests/unit/reducer.test.ts`, `tests/unit/guide.test.ts`, `tests/unit/matching.test.ts`, `tests/e2e/helpers.ts`, every e2e spec that taps the phone **Continue** and expects the package form

**Interfaces (produced):**
- `Step` gains `'home'`, placed between `'phone'` and `'post'` in `STEPS`.
- `Panel = null | 'chat' | 'postTrip' | 'search' | 'trips' | 'profile'`.
- `export type TabPanel = 'search' | 'trips' | 'profile'`.
- `export const TAB_PANELS: readonly TabPanel[]` (in `types.ts`).
- `DemoAction` gains `{ type: 'startSend' }`, which moves `home` to `post`.
- `Item` becomes `{ id: string; name: string; category: ItemCategory; description: string; weightKg: number; value: number; photo: string }`. `photo` is a path under `/items/`.
- `Story` gains these fields:
  - `mode: 'flight' | 'car'`;
  - `originCode: string | null` and `destinationCode: string | null` (`'IAD'`/`'ADD'` for diaspora, `null` for domestic);
  - `popularRoutes: PopularRoute[]`, where `PopularRoute = { from: { country: Country; city: string }; to: { country: Country; city: string } }` and `Country = 'US' | 'GB' | 'CA' | 'ET'`.
- `Guide` is unchanged in shape.

- [ ] **Step 1: Write the failing unit tests** in `tests/unit/reducer.test.ts`:
  - `confirmPhone with the right code lands on home`: `step === 'home'`, `phoneVerified === true`.
  - `startSend moves home to post, and is ignored anywhere else`: from `home` (sender view) → `'post'`. From `post`, or from `home` on the traveler view, it returns the same state object (`toBe`).
  - `switching views opens at home`: at `home`, `switchView traveler` → `view === 'traveler'`. At `phone`, it returns the same object.
  - `the traveler can open Post a trip from home`: at `home`, after a switch to the traveler, `openPanel postTrip` → `panel === 'postTrip'`.
  - `tab panels open from home on either phone, and never change step`: for each of `TAB_PANELS`, at `home` and at `paid`, `openPanel` sets `panel` and leaves `step` as it was. At `phone` it returns the same object.
  - `switchView closes a tab panel`: with `panel === 'trips'`, a switch gives `panel === null`.
  - **Update every existing walk** that goes `confirmPhone → postPackage`, so it dispatches `startSend` in between.
- [ ] **Step 2:** Add `tests/unit/guide.test.ts` cases:
  - at `home`, `who === 'sender'`, `title === 'Home'`, and `next === 'Tap Send an Item.'`;
  - at `home` on the traveler view, `next === 'Switch to Selam, then tap Send an Item.'`;
  - with `panel` set to any tab panel, `next === 'Tap Home to continue.'`;
  - at `post`, `next === 'Check the item, tap Next twice, then Find travelers.'`.
- [ ] **Step 3:** Add `tests/unit/matching.test.ts` cases:
  - `validatePackage needs a name for each item but not a description`: an empty `name` gives the error `'Name each item'`; an empty `description` is accepted.
  - `rejects a negative item value`: `value: -1` gives `'Enter a value of 0 or more'`.
  - Remove the old "empty description" assertion.
- [ ] **Step 4:** Run `npm test`. Expected: the new cases FAIL (type errors or wrong step).
- [ ] **Step 5:** Implement the changes.
  - **`types.ts`:** apply the Interfaces block.
  - **`reducer.ts`:**
    - `confirmPhone` goes to `'home'`.
    - Add `startSend`, which requires `at('home', 'sender')`.
    - `switchView` and `openPanel postTrip` gate on `reached(state, 'home')`.
    - `openPanel` for a `TabPanel` requires `reached(state, 'home')`; it works on either view.
  - **`matching.ts`:** use the two new messages. Keep the order of the other errors.
  - **`stories.ts`:** give each sample item an `id` (`'item-1'`, `'item-2'`), a `name` (the old description), an empty description and a `value`:
    - diaspora: Laptop 450, Medicine 40 (USD);
    - domestic: Contracts 0, Dresses 3500 (ETB).
    - Set `photo` to `/items/<slug>.svg`; Task 5 adds the files.
  - **Also in `stories.ts`, the routes and mode:**
    - Diaspora: `mode: 'flight'`, `IAD`/`ADD`, and three `popularRoutes`: US Washington, DC; GB London; CA Toronto; each → ET Addis Ababa.
    - Domestic: `mode: 'car'`, `null` codes, and three routes: ET Addis Ababa → ET Hawassa, Bahir Dar, Dire Dawa.
  - **`guide.ts`:**
    - Add a `home` entry: who `'sender'`, title `'Home'`, body "{sender}'s account is active. Home is where she sends an item, or posts a trip of her own.", action `'Tap Send an Item.'`.
    - Change the `post` action to "Check the item, tap Next twice, then Find travelers." Task 5 makes the form match it.
    - When `state.panel` is a `TabPanel`, `next` is `'Tap Home to continue.'`, overriding the switch wording.
  - **The two switch gates:** `ViewSwitch` and `DemoLayout`'s `switchTo` use `reached(state, 'home')`.
  - **`ScreenRouter`:** sender at `home` → `HomeScreen`.
  - **`PostPackageScreen`:** today's `description` input becomes **Item name**, bound to `name`. Add an optional Description input. `value` keeps its prefilled number until Task 5 adds its field.
  - **Traveler-side item lines:** they show `item.name`.
- [ ] **Step 6:** Update the `tests/e2e/helpers.ts` LEGS.
  - The leg that taps the phone **Continue** now ends at `'home'`, and expects `nextStep` to be `'Tap Send an Item.'`.
  - A new `'post'` leg taps **Send an Item**.
  - `full-flow.spec.ts` taps **Send an Item** after the phone Continue.
  - Search the other specs for `'Tap Find travelers.'` and for a phone Continue followed by `Find travelers`, and add the same tap.
  - Until Task 5, the post step's guide text is the new string, so specs that assert `'Tap Find travelers.'` now assert `'Check the item, tap Next twice, then Find travelers.'`.
- [ ] **Step 7:** Run the full check: `npm test && npx tsc --noEmit && npm run lint && npx playwright test > /tmp/e2e.log 2>&1; tail -5 /tmp/e2e.log`. Expected: everything passes; e2e shows 107 passed and 1 skipped (same count).
- [ ] **Step 8: Commit:** `feat(demo): home step, tab panels and item names in the demo state`.

### Task 2: The new look

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`, `src/components/ui.tsx`, `src/components/DemoLayout.tsx`, `src/components/ViewSwitch.tsx`
- Create: `src/components/Logo.tsx`, `src/components/Flag.tsx`, `src/components/Avatar.tsx`, `src/components/avatarTint.ts`
- Test: `tests/unit/avatar.test.ts`, `tests/e2e/look.spec.ts`

**Interfaces (produced):**
- `<Logo size?: 'sm' | 'lg' />`: an inline SVG paper plane plus "Yizzo" in `brand`. It has `role="img"` and `aria-label="Yizzo"`.
- `<Flag country: Country className?: string />`: inline SVG, `aria-hidden`.
- `avatarTint(name: string): { bg: string; fg: string }`: deterministic. It picks from a fixed list of 5 Tailwind class pairs by a character-code sum mod 5.
- `initials(name: string): string`: up to 2 uppercase letters, taken from the first and last words. A single word gives its first letter.
- `<Avatar name: string size?: 'sm' | 'md' | 'lg' />`: a circle with `aria-hidden` initials. The name is always shown as text next to it by the caller.
- `Card` gets a 20 px radius, a soft shadow and no border. `Button` primary is navy; secondary is a white fill with a navy outline. The props are unchanged.

- [ ] **Step 1:** Write `tests/unit/avatar.test.ts`:
  - `initials('Dawit Bekele') === 'DB'`;
  - `initials('Meron') === 'M'`;
  - `initials('  selam  tesfaye ') === 'ST'`;
  - `avatarTint('Dawit Bekele')` equals itself on a second call;
  - the five tints are not all the same across `['Dawit Bekele','Hirut Alemu','Yonas Girma','Abebe Tadesse','Tigist Mengistu']`.
- [ ] **Step 2:** Write `tests/e2e/look.spec.ts`:
  - `the app bar shows the Yizzo logo after Welcome`: `walkTo(page,'diaspora','signup')`, then `getByRole('img',{name:'Yizzo'})` is visible inside `header`.
  - `primary buttons are navy`: `getComputedStyle` of "Create account" gives `background-color` `rgb(11, 31, 75)`. If the builder picks a different shade, use the token value.
- [ ] **Step 3:** Run both. Expected: FAIL (modules missing, green color).
- [ ] **Step 4: Implement.**
  - **Tokens:** set them in `globals.css` and add `--color-sky`. Set `--background` to `#F7F9FC`.
  - **`layout.tsx`:** use `Plus_Jakarta_Sans` with `variable: '--font-jakarta'` on the root, and replace every `--font-inter` reference with `--font-jakarta`, and set `themeColor` to the navy.
  - **`DemoLayout` app bar:** `Logo size="sm"` on the left, `MessageButton` on the right, with `ViewSwitch` below as today.
  - **Phone banner:** navy.
  - **Laptop guide:** a `Logo size="lg"` at the top, and a `sky` left border on the next-step box instead of `accent`.
  - **`ViewSwitch`:** active pill `bg-white text-brand`, track `bg-brand-soft`, and a `sky` pulse dot.
  - Replace `stone` neutrals with `slate` where they're used for text or borders. Text contrast must still pass on white.
- [ ] **Step 5:** Run the full check. Expected: everything green, plus the new tests.
- [ ] **Step 6: Commit:** `feat(demo): navy and light-blue look, logo, flags and avatars`.

### Task 3: Welcome screen and story sheet

**Files:**
- Modify: `src/screens/StartScreen.tsx` (rename the file to `WelcomeScreen.tsx` and update the import in `ScreenRouter`)
- Create: `src/components/Sheet.tsx`
- Test: `tests/e2e/start.spec.ts`, `tests/e2e/helpers.ts`, every spec that taps `/Diaspora/` or `/Domestic/` from `/` (11 places)

**Interfaces (produced):**
- `<Sheet title: string onClose: () => void children />`:
  - a bottom sheet over the app frame, with `role="dialog"`, `aria-modal`, and `aria-labelledby` set to its title;
  - Escape closes it, Tab is trapped inside, and focus goes to the first button inside on open and back to the opener on close;
  - it slides up 200 ms ease-out, with no motion under `prefers-reduced-motion`.

  The Fayda sheet in `VerifyScreen` keeps its own code; don't refactor it.
- `async function pickStory(page: Page, story: StoryId)` in `helpers.ts`: it taps **Get Started**, then the story card in the sheet. `walkTo` uses it.

- [ ] **Step 1:** Update `tests/e2e/start.spec.ts`:
  - `Welcome shows the tagline, Get Started and the sample-data note`: the text "People move the world closer." is visible; a "Get Started" button exists; "Demo with sample data" is visible; there is no button named "I already have an account".
  - `Get Started opens the story sheet; Escape closes it and returns focus`: the dialog "Pick a story" is visible with 2 buttons matching `/Diaspora|Domestic/`. After Escape, the dialog is hidden and "Get Started" is focused.
  - `picking a story starts sign-up`: after `pickStory(page,'domestic')`, the "Create account" button is visible.
  - Replace the direct story taps in the other specs with `pickStory`.
- [ ] **Step 2:** Run `npx playwright test tests/e2e/start.spec.ts`. Expected: FAIL.
- [ ] **Step 3: Implement `WelcomeScreen`.**
  - **Background:** `public/welcome.jpg` as a full-bleed background if the file exists. Do the check at build time: `next.config.ts` sets `env.NEXT_PUBLIC_HAS_WELCOME_PHOTO` from `fs.existsSync('public/welcome.jpg')`, and the screen reads it. A client component can't import `fs`. If the user's license needs a credit line, show it in small white text at the bottom. Without the photo, a navy-to-`sky` gradient with a large faint paper plane.
  - **Text:** a dark bottom scrim; a white `Logo size="lg"`; the tagline as h1; and "Send packages with travelers already going your way."
  - **Buttons:** a white primary "Get Started" button, which opens the `Sheet` titled "Pick a story" with today's two story cards.
  - **Footer:** "Demo with sample data".
- [ ] **Step 4:** Run the full check. Expected: everything green.
- [ ] **Step 5: Commit:** `feat(demo): photo welcome screen with a story sheet`.

### Task 4: Home screen

**Files:**
- Modify: `src/screens/HomeScreen.tsx`
- Test: `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes `Story.popularRoutes`, `Flag`, `Avatar`, and `startSend`.

- [ ] **Step 1:** Write `tests/e2e/home.spec.ts` (both stories where relevant):
  - `home greets the sender by first name`: after `walkTo(page,'diaspora','home')`, the heading "Hi, Selam" is visible.
  - `Send an Item starts the form`: after the tap, `nextStep` is the post text and an "Item details" step is visible. Until Task 5 there's no stepper, so for now assert that the "Find travelers" button is visible, and Task 5 updates this assertion.
  - `Traveling Soon? switches to the traveler's phone`: after the tap, `getByRole('button',{name:/^Traveler ·/})` has `aria-pressed=true` and "Post a trip" is visible.
  - `popular routes show 50+ active travelers next to Sample data`: 3 rows each contain "50+ active travelers"; "Sample data" is visible in the same section (`getByRole('region',{name:'Popular routes'})`); diaspora rows contain "USA", "UK" and "Canada".
  - `domestic home lists Ethiopian routes`: in the domestic story, the rows contain "Hawassa", "Bahir Dar" and "Dire Dawa", and none contain "USA".
  - `How Yizzo Works has four steps`: the region "How Yizzo Works" contains 4 list items.
  - `a long name doesn't overflow Home`: sign up with the name `'A'.repeat(60)`; at `home`, `document.documentElement.scrollWidth <= window.innerWidth` and `main.scrollWidth <= main.clientWidth`.
  - `route rows are not buttons`: there are 0 buttons inside the "Popular routes" region.
- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3: Implement `HomeScreen`.**
  - **Greeting:** an h1 "Hi, {first name of state.account.name}" with `break-words`, plus an `Avatar` and a sub-line "Where is your package going?".
  - **Two cards, as buttons:** "Send an Item" (navy, a package icon, sub-line "Find a traveler on your route"), which dispatches `startSend`; and "Traveling Soon?" (light blue, a plane icon for flight or a car icon for car, sub-line "Earn by carrying a package"), which dispatches `switchView traveler`.
  - **The "Popular routes" section (`aria-labelledby`):** a "Sample data" pill next to the heading. Each row shows flag, city and country → flag, city and country, with "50+ active travelers" on the right.
  - **The "How Yizzo Works" section:** an `<ol>` of 4 items with icons and the spec's exact lines:
    1. "Post your item"
    2. "Match with a verified traveler"
    3. "Pay safely into escrow"
    4. "Get it delivered and rate"
- [ ] **Step 4:** Run the full check. Expected: everything green.
- [ ] **Step 5: Commit:** `feat(demo): home screen with routes and how it works`.

### Task 5: Send an Item (3 steps) and the photo store

**Files:**
- Modify: `src/screens/PostPackageScreen.tsx` (rename it to `SendItemScreen.tsx`), `src/demo/DemoProvider.tsx`
- Create: `src/components/Stepper.tsx`, `src/demo/photos.ts`, the `public/items/*.svg` files (laptop, medicine, contracts, dresses, plus `generic.svg` for added items), `public/items/README.md`, `tests/e2e/fixtures/photo.png` (a small PNG of a box, made in the repo)
- Test: `tests/unit/photos.test.ts`, `tests/e2e/send-form.spec.ts`, `tests/e2e/package.spec.ts`

**Interfaces (produced):**
- In `src/demo/photos.ts`, `export const MAX_PICKED = 2`: a bundled photo plus 2 picked makes 3.
- `type PhotoStore = ReadonlyMap<string, readonly string[]>`, from item id to object URLs.
- `addPhoto(store, itemId, url): { store: PhotoStore; added: boolean }`: `added` is false when the item already has `MAX_PICKED`.
- `removePhoto(store, itemId, url): PhotoStore`.
- `removeItemPhotos(store, itemId): { store: PhotoStore; revoked: string[] }`.
- `allUrls(store): string[]`.
- Each function is pure; the provider calls `URL.revokeObjectURL` on what comes back.
- `usePhotos(): { photosFor(itemId: string): readonly string[]; add(itemId: string, file: File): void; remove(itemId: string, url: string): void; removeItem(itemId: string): void }`, from `DemoProvider`.
  - The store is not cleared by `postPackage`.
  - It is cleared, with every URL revoked, on `restart` and `chooseStory`.
- `<Stepper steps: string[] current: number />`: an `<ol>` with `aria-current="step"` on the current item.
- **Item ids:** new items get `item-${nextKey}`, so ids stay unique in a draft.

- [ ] **Step 1:** Write `tests/unit/photos.test.ts`:
  - adding 2 photos to `item-1` succeeds and a 3rd returns `added:false`;
  - `removePhoto` leaves the others in order;
  - `removeItemPhotos` returns exactly that item's URLs;
  - the other items are untouched.
- [ ] **Step 2:** Write `tests/e2e/send-form.spec.ts`:
  - `the stepper walks Item details → Preferences → Review`: at the start, `aria-current` is on "Item details". "Next" goes to Preferences; "Next" again goes to Review. The Review shows each item name, the reward and the fee lines; "Find travelers" goes to matches.
  - `Back keeps entered values`: change the first item name to "Gift" and weight to "1.5", Next, Back; the fields show "Gift" and "1.5".
  - `an invalid weight stops Next on Item details`: weight "0" → after "Next", the error "Enter a weight between 0.1 and 30 kg" shows and the stepper is still on "Item details".
  - `switching phones keeps the step and values`: on Preferences, set the reward to "75", switch to the traveler, switch back; it's still on Preferences with "75".
  - `a picked photo survives edit and clears on restart`:
    - `setInputFiles` on the first item's "Add photo" input with `fixtures/photo.png`; a second thumbnail appears.
    - Then Next, Next, Find travelers, then "Edit package": the item shows 2 thumbnails.
    - Then "Restart demo", then `pickStory`, then walk to `post`: 1 thumbnail.
  - `a third picked photo is refused`: after 2 picks, the "Add photo" control is gone and "Up to 3 photos" is visible.
  - Update `package.spec.ts` wherever it taps "Find travelers" directly from the form, so it walks Next, Next first.
- [ ] **Step 3:** Run them. Expected: FAIL.
- [ ] **Step 4: Implement.**
  - **Photo store:** write `photos.ts`, and add the store to `DemoProvider` (`useState` plus `usePhotos`).
  - **`SendItemScreen` state:** the stepper index goes in `useDraft('package.step', () => 0)`.
  - **Step 0, per item:**
    - thumbnails: the bundled `item.photo`, plus the picked ones, each removable;
    - an "Add photo" tile: a visually hidden `<input type="file" accept="image/*">` inside a label at least 44 px tall, with an accessible name "Add photo for {item name}";
    - name, category, weight with a "kg" suffix, value with a currency prefix, and an optional description;
    - "Add another item" (new items use `/items/generic.svg`), and remove.
  - **Step 1:** route (read-only), preferred dates and reward.
  - **Step 2:** the Review summary (items with the first thumbnail, route, dates, and `computeFees` lines labeled the way `EscrowScreen` labels them), Back, and Find travelers.
  - **Validation:** Next on each step validates only that step's fields, using `validatePackage`'s messages and filtering by field.
  - **Edit package** returns to step 0. Reset the `package.step` draft when `editPackage` lands; the drafts are already cleared on post, so step 0 is the default.
  - **Illustrations:** simple flat object SVGs drawn for this repo. The README says so.
- [ ] **Step 5:** Run the full check. Expected: everything green. Update the `home.spec` "Send an Item" assertion to the "Item details" stepper.
- [ ] **Step 6: Commit:** `feat(demo): three-step send form with item photos`.

### Task 6: Available Travelers

**Files:**
- Modify: `src/screens/MatchesScreen.tsx`
- Create: `src/components/TravelerCard.tsx`
- Test: `tests/e2e/travelers.spec.ts`

**Interfaces (produced):**
- `<TravelerCard traveler: Traveler story: Story badge?: 'best' action?: ReactNode />`:
  - it renders an `<article aria-label={traveler.name}>`;
  - Task 7's Search panel reuses it without `action`.

- [ ] **Step 1:** Write `tests/e2e/travelers.spec.ts`:
  - `the header shows flags, route, dates and the real count`: at `matches` (diaspora), the text "Washington, DC → Addis Ababa" and "3 travelers for your package" are visible, and no text matches `/\d+ travelers available/`.
  - `diaspora cards show airports`: the first article contains "IAD → ADD", "Best match", "Verified", "23 reviews" and "8 kg free".
  - `domestic travelers show by car, not airports`: the first article contains "by car" and doesn't match `/[A-Z]{3} → [A-Z]{3}/`.
  - `there is no filter button`: 0 buttons named `/filter/i`.
- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3: Implement `TravelerCard`.**
  - **Top row:** `Avatar`, name, a Verified tick, `Stars`, "{rating} · {trips} reviews", and the "Best match" badge.
  - **Details row:** calendar and `formatRange`; then either a plane icon with "{originCode} → {destinationCode}" or a car icon with "by car"; then the luggage icon with "{spareKg} kg free".
  - **`MatchesScreen` header:** flags from `story.popularRoutes[0]` endpoints, "{origin} → {destination}", `formatRange(pkg.preferredDeparture, pkg.preferredArrival)`, and "{n} travelers for your package". Then the cards, the empty state and Edit package.
  - The existing e2e tests that use `getByRole('article')` must still pass.
- [ ] **Step 4:** Run the full check. Expected: everything green.
- [ ] **Step 5: Commit:** `feat(demo): restyled travelers list with avatars and routes`.

### Task 7: Bottom tab bar and the Search, Trips, Profile and + screens

**Files:**
- Create: `src/components/TabBar.tsx`, `src/screens/SearchPanel.tsx`, `src/screens/TripsPanel.tsx`, `src/screens/ProfilePanel.tsx`
- Modify: `src/components/DemoLayout.tsx` (render `TabBar` below `main`), `src/screens/ScreenRouter.tsx` (tab panels first)
- Test: `tests/e2e/tabs.spec.ts`

**Interfaces:**
- Consumes `TabPanel`, `TAB_PANELS`, `TravelerCard`, `Sheet` and `usePhotos`.
- `<TabBar />`:
  - it renders `<nav aria-label="Tabs">` with buttons named "Home", "Search", "New", "Trips" and "Profile"; the raised + is named "New";
  - the current tab has `aria-current="page"` (Home when `panel` isn't a tab panel);
  - **when it shows:** `reached(state,'home')`, and `panel` is not `'chat'` or `'postTrip'`, and the sender isn't in the Send form at `step === 'post'`.
- **What each tab does:**
  - **Home:** `closePanel`.
  - **Search, Trips, Profile:** `openPanel`.
  - **New (sender):** `startSend` at `home`; otherwise it opens a `Sheet` "One package at a time in the demo" with the button "Back to my package", which closes it.
  - **New (traveler):** `openPanel postTrip`.

- [ ] **Step 1:** Write `tests/e2e/tabs.spec.ts`:
  - `each tab opens a screen and Home returns to the flow`: at `home`, `paid` and `done` (via `walkTo`), and for each of Search, Trips and Profile:
    - tap it, expect a new h1 ("Search", "Trips", "Profile");
    - tap Home, expect the step's own h1 again ("Hi, Selam" at `home`).
  - `the tab bar is hidden during onboarding, in the Send form and in chat`: 0 `nav[aria-label=Tabs]` at `signup`, at `post`, and with chat open.
  - `Search before posting offers Send an Item`: at `home`, Search shows 3 articles with no "Send offer", plus a button "Post your item"; tapping it lands on the stepper's "Item details".
  - `Search on the traveler's phone shows the posted package`: at `offerSent` on the traveler view, Search shows the package route and reward. At `home` on the traveler view, it shows "No packages on your routes yet".
  - `Trips shows the delivery status`: at `paid`, Trips shows "Held". At `home`, it shows "No deliveries yet" and a "Send an Item" button that starts the form.
  - `Profile shows the verified ticks and restarts`: it shows "Fayda verified" and "Phone confirmed"; "Restart demo" in Profile returns to Welcome.
  - `New starts the form at home, and explains itself after`: at `home`, New → Item details. At `matches`, New opens the dialog "One package at a time in the demo", and "Back to my package" closes it, leaving the matches showing.
  - `New on the traveler's phone opens Post a trip`.
  - `banner switch closes a tab panel` (phone only): at `offerSent`, sender view, open Trips; the banner reads "Tap Home to continue."; tap the Home tab; the banner now offers the switch; tap it; the traveler's phone shows with no panel.
- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3: Implement** the panels as specified in the spec's "Bottom tab bar" section.
  - Each panel has its own h1.
  - **Trips:** shows the `StatusPill` for the current step (sent before paid, held from paid to delivered, released after), the route and the other person's name. On the traveler's phone, it also lists `state.trips`.
  - **Profile:** shows `Avatar`, name, email, the two ticks and, once revealed, "Your rating: n★", plus Restart demo.
  - **Layout:** the tab bar is sticky at the bottom of the app frame, with the content padded so nothing is hidden behind it. It has a safe-area inset for phones.
- [ ] **Step 4:** Run the full check. Expected: everything green.
- [ ] **Step 5: Commit:** `feat(demo): bottom tab bar with search, trips and profile`.

### Task 8: Restyle the remaining screens; no-dead-controls sweep

**Files:**
- Modify: `SignUpScreen`, `VerifyScreen`, `PhoneScreen`, `EscrowScreen`, `ChatScreen`, `DeliveryScreen`, `RatingScreen`, `DoneScreen`, `TravelerHomeScreen` (a "Hi, {first name}" greeting, `Avatar`, and item thumbnails from `usePhotos`/`item.photo`), `PostTripScreen`
- Test: `tests/e2e/no-dead-controls.spec.ts`

- [ ] **Step 1:** Write `tests/e2e/no-dead-controls.spec.ts`. For each step in `['home','matches','paid','done']` (diaspora):
  - walk there, then collect every visible enabled button in `main` and the tab bar, skipping "Restart demo";
  - for each one, take a fresh `walkTo`, tap it, and assert that something changed: `page.locator('main').innerHTML()`, the URL, or a dialog appearing.

  Keep the list small by de-duplicating on accessible name.
- [ ] **Step 2:** Run it. Expected: it passes, or fails and names the dead control. Fix any failure in the owning screen.
- [ ] **Step 3: Restyle the listed screens** with the shared `Card`, `Button` and `Avatar` and the new tokens. Copy and behavior stay as they are.
  - The traveler's offer card shows the first item's photo, picked or bundled.
  - The Fayda sheet keeps its focus trap and its "Demo — simulated Fayda sign-in" label.
- [ ] **Step 4:** Run the full check, plus `npm run build`. Expected: everything green. The total e2e count is the old 107 plus the new specs, with 1 skip (the phone-only banner test on laptop) and any new `isMobile` skips.
- [ ] **Step 5:** Manual check. After `npm run build`, run `python3 -m http.server 3100 -d out` in the background (no new packages) and look at both stories at 390×844 and at 1440×900, with and without `public/welcome.jpg` (use any local test image, and don't commit it unless it's the user's photo). Take screenshots for the user.
- [ ] **Step 6: Commit:** `feat(demo): restyle the remaining screens in the new look`.

### Task 9: Hand-off

- [ ] **Step 1:** Run the final whole-branch review, following the execution skill.
- [ ] **Step 2:** Tell the user the result and the screenshots. Ask whether to push `feat/redesign` for a Vercel preview, then whether to merge to `main`, which updates the live link. Ask for the welcome photo if it hasn't arrived.
