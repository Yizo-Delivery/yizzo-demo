# Yizzo Investor Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A static, clickable Yizzo app demo on Vercel that walks an investor through one whole delivery, from both the sender's and the traveler's side, in a Diaspora story and a Domestic story.

**Architecture:**
- A Next.js App Router app exported as a static site.
- One client-side store (a React context and a pure reducer) holds the whole demo; a screen router picks the screen from the store.
- The domain logic is pure TypeScript with Vitest unit tests: stories, fees, matching and the reducer. The screens are tested end to end with Playwright at a phone size and a laptop size.

**Tech Stack:**
- Next.js (latest, App Router), TypeScript, Tailwind CSS
- Vitest, Playwright
- lucide-react, Inter via `next/font/google`

**Spec:** `docs/superpowers/specs/2026-11-15-investor-demo-design.md`. Read it first. Its "The flow" section is the screen order, and its "Anti-goals" section limits every screen.

## Global Constraints

**Project and stack**
- Repo: `/Users/mw/yizzo-demo`, GitHub `Yizo-Delivery/yizzo-demo`. Never touch `/Users/mw/yizzo` except to copy the spec and this plan out of it.
- Static export: `output: 'export'` and `images: { unoptimized: true }`.
- No backend, no network calls at runtime (no analytics, no fonts other than Inter via `next/font`), and no `localStorage`. State is in memory only.

**Copy and branding**
- English only. The wordmark is the text "Yizzo". Nothing from CarryOn: no name, copy, images or colors.
- The start screen footer says exactly `Demo with sample data`.
- The Fayda step is labeled exactly `Demo — simulated Fayda sign-in`, with no official logo.

**Colors and type**
- Primary is deep green `#0F5132`, the accent is warm yellow `#F2C14E`, and the background is `#FAFAF7`.
- Status colors: held is amber (`#B45309`), released is green (`#15803D`), and offer sent is blue (`#1D4ED8`).
- Every tap target is at least 44×44 px, and text contrast is AA.

**Fees**
- Fee: `reward × 10%`.
- Tax: `(reward + fee) × 8%`.
- Rounding: each part is rounded on its own (to cents for USD, to whole birr for ETB), and the total is the sum of the rounded parts.

**Commits and tests**
- Commit messages are `feat(scope): …`, `chore(…)` or `test(…)`, with **no Co-Authored-By trailer**.
- Commit only when the user says to.
- Always: `npm test` is Vitest; `npm run e2e` is Playwright.

## Review Focus

1. **Double taps.** Tapping Pay, Accept or Confirm twice must not double-charge or skip a step. The reducer ignores an action that doesn't fit the current step (Task 1 test `ignores out-of-order actions`).
2. **The wrong side acts.** A sender action fired while the traveler's view is shown is ignored, and so is the reverse (Task 1 test `ignores actions from the wrong view`).
3. **An investor edits the package to be heavy.** At 30 kg, no traveler has room. The matches screen says so and offers **Edit package**; it is never a dead end (Task 1 `matchTravelers` test and Task 4 e2e `no room → edit package`).
4. **A wrong phone code or a bad field.** A wrong code shows `That code isn't right` and stays on the screen. An empty item weight, a weight of 0, or a reward of 0 or less blocks Continue, with a message (Tasks 1, 3 and 4).
5. **Restart or switching stories partway through.** Afterwards there are no leftover messages, ratings or escrow (Task 1 test `restart clears everything`, and Task 8 e2e).

---

## File Structure

```
yizzo-demo/
  docs/specs/2026-11-15-investor-demo-design.md   (copied from the backend repo)
  docs/plans/2026-11-15-investor-demo.md           (this file, copied)
  next.config.ts            static export
  playwright.config.ts      projects: phone (390×844), laptop (1440×900)
  vitest.config.ts
  src/app/layout.tsx        Inter, metadata, background
  src/app/page.tsx          <DemoProvider><DemoLayout/></DemoProvider>
  src/app/globals.css       Tailwind and color tokens
  src/demo/types.ts         every domain type
  src/demo/fees.ts          computeFees, formatMoney
  src/demo/stories.ts       DIASPORA, DOMESTIC, getStory
  src/demo/matching.ts      matchTravelers
  src/demo/reducer.ts       initialState, demoReducer
  src/demo/guide.ts         guideFor(state)
  src/demo/DemoProvider.tsx context and the useDemo() hook
  src/components/DemoLayout.tsx    phone frame + guide panel (laptop) / banner (phone)
  src/components/ViewSwitch.tsx    sender/traveler switch
  src/components/ui.tsx            Button, Card, Field, StatusPill, Stars
  src/screens/ScreenRouter.tsx     state → screen
  src/screens/*.tsx                one file per screen (named in each task)
  tests/unit/*.test.ts
  tests/e2e/helpers.ts      walkTo(page, story, step)
  tests/e2e/*.spec.ts
```

## Shared Types (Task 1 defines them; every later task uses them)

```ts
export type StoryId = 'diaspora' | 'domestic';
export type Currency = 'USD' | 'ETB';
export type View = 'sender' | 'traveler';
export type ItemCategory = 'Documents' | 'Package' | 'Clothing' | 'Fragile' | 'Food' | 'Electronics' | 'Other';
export type Step =
  | 'start' | 'signup' | 'verify' | 'phone' | 'post' | 'matches'
  | 'offerSent' | 'offerAccepted' | 'confirmed' | 'paid'
  | 'pickedUp' | 'inTransit' | 'delivered' | 'released' | 'rating' | 'done';
export type Panel = null | 'chat' | 'postTrip';

export interface Person { id: string; name: string; city: string }
export interface Traveler extends Person {
  rating: number; trips: number; spareKg: number;
  departure: string; arrival: string;   // ISO dates
  dateDiffDays: number;                  // distance from the package's preferred date
}
export interface Item { category: ItemCategory; description: string; weightKg: number }
export interface PackageDraft {
  items: Item[]; origin: string; destination: string;
  preferredDeparture: string; preferredArrival: string; reward: number;
}
export interface Trip { origin: string; destination: string; departure: string; arrival: string; capacityKg: number }
export interface Message { id: string; from: View; text: string; at: string }
export interface Fees { reward: number; fee: number; tax: number; total: number }
export interface Rating { stars: 1|2|3|4|5; review?: string }

export interface Story {
  id: StoryId; title: string; subtitle: string; currency: Currency;
  sender: Person & { email: string; phoneMasked: string };
  phoneCode: string;            // '482913' in both stories
  packageDraft: PackageDraft;   // the prefilled package
  travelers: Traveler[];        // 3; travelers[0] is the best match
  travelerTrips: Trip[];        // the best match's existing trips
  seededMessages: Message[];    // 2–3, shown when chat first opens
  cannedReply: string;          // the traveler's one reply to the sender's first message
}

export interface DemoState {
  storyId: StoryId | null; step: Step; view: View; panel: Panel;
  account: { name: string; email: string } | null;
  identityVerified: boolean; phoneVerified: boolean; codeError: boolean;
  pkg: PackageDraft | null; chosenTravelerId: string | null;
  fees: Fees | null; messages: Message[]; replied: boolean;
  trips: Trip[];
  ratings: { sender: Rating | null; traveler: Rating | null };
}

export type DemoAction =
  | { type: 'chooseStory'; story: StoryId }
  | { type: 'signUp'; name: string; email: string }
  | { type: 'verifyIdentity' }
  | { type: 'confirmPhone'; code: string }
  | { type: 'postPackage'; pkg: PackageDraft }
  | { type: 'editPackage' }                         // matches → post
  | { type: 'sendOffer'; travelerId: string }
  | { type: 'switchView'; view: View }
  | { type: 'acceptOffer' }
  | { type: 'confirmTraveler' }
  | { type: 'payEscrow' }
  | { type: 'openPanel'; panel: Exclude<Panel, null> }
  | { type: 'closePanel' }
  | { type: 'sendMessage'; text: string }
  | { type: 'advanceDelivery' }                     // paid → pickedUp → inTransit → delivered
  | { type: 'confirmDelivery' }
  | { type: 'rate'; rating: Rating }
  | { type: 'postTrip'; trip: Trip }
  | { type: 'finish' }                              // rating → done, once both have rated
  | { type: 'restart' };                            // back to initialState
```

**Which view may fire which action.** The reducer returns the same state object, unchanged, for any action that doesn't fit:

| Action | Step required | View |
|---|---|---|
| chooseStory | start | any |
| signUp | signup | sender |
| verifyIdentity | verify | sender |
| confirmPhone | phone (a wrong code sets `codeError`) | sender |
| postPackage | post | sender |
| editPackage | matches | sender |
| sendOffer | matches | sender |
| acceptOffer | offerSent | traveler |
| confirmTraveler | offerAccepted | sender |
| payEscrow | confirmed (sets `fees`) | sender |
| advanceDelivery | paid → pickedUp → inTransit → delivered | traveler |
| confirmDelivery | delivered → released | sender |
| rate | released or rating; one rating per view; first rating → `rating` | either |
| finish | rating, with both ratings set | any |
| switchView | any step after phone | any |
| openPanel 'chat' | offerSent or later | any |
| openPanel 'postTrip' | after phone, traveler view | traveler |
| sendMessage | chat panel open; text trimmed is 1–2000 characters | either |
| postTrip | postTrip panel open | traveler (appends and closes the panel) |
| restart | any | any |

`sendMessage` from the sender, while `replied` is false, also appends the traveler's `cannedReply` and sets `replied`. The first `openPanel 'chat'` seeds `messages` from `story.seededMessages` when they're empty. `chooseStory` sets `trips` to `story.travelerTrips`.

---

### Task 0: Scaffold the project

**Files:**
- Create: the project via create-next-app, plus `next.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `tests/e2e/start.spec.ts`, and `docs/specs/…` and `docs/plans/…` (copied)
- Modify: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `package.json` scripts

**Interfaces:**
- Produces: the scripts `npm test` (`vitest run`), `npm run e2e` (`playwright test`), `npm run build` (static export to `out/`). Playwright's webServer is `npm run build && npx serve@14 out -l 3100`, with baseURL `http://localhost:3100`.

- [ ] **Step 1:** `cd /Users/mw && npx create-next-app@latest yizzo-demo --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack`. Then `cd yizzo-demo && npm i lucide-react && npm i -D vitest @playwright/test && npx playwright install chromium`.
- [ ] **Step 2:** Copy the spec and this plan into `docs/specs/` and `docs/plans/`.
- [ ] **Step 3: Write the failing test** `tests/e2e/start.spec.ts`:
  ```ts
  test('start screen shows the wordmark, both stories and the sample-data note', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Yizzo', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Diaspora/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Domestic/ })).toBeVisible();
    await expect(page.getByText('Demo with sample data')).toBeVisible();
  });
  ```
- [ ] **Step 4:** Run `npm run e2e`. Expected: FAIL (the default Next page).
- [ ] **Step 5:** Set up the static export and the Playwright projects `phone` (viewport 390×844, `isMobile: true`) and `laptop` (1440×900). Put Inter and the color tokens in `layout.tsx`/`globals.css`. Make `page.tsx` a temporary static start screen: wordmark, the two story buttons and the footer. Task 2 replaces it.
- [ ] **Step 6:** Run `npm run e2e`. Expected: PASS in both projects. Run `npm run build`. Expected: `out/index.html` exists.
- [ ] **Step 7:** `git init`, add `.gitignore` entries for `out/`, `test-results/` and `playwright-report/`. Commit `chore: scaffold the Yizzo investor demo`.

### Task 1: The domain — stories, fees, matching, reducer

**Files:**
- Create: `src/demo/types.ts` (the Shared Types above, verbatim), `src/demo/fees.ts`, `src/demo/stories.ts`, `src/demo/matching.ts`, `src/demo/reducer.ts`, `src/demo/DemoProvider.tsx`
- Test: `tests/unit/fees.test.ts`, `tests/unit/matching.test.ts`, `tests/unit/reducer.test.ts`

**Interfaces:**
- Produces:
  - `computeFees(reward: number, currency: Currency): Fees`
  - `formatMoney(amount: number, currency: Currency): string`: `$71.28` and `713 ETB`.
  - `getStory(id: StoryId): Story`
  - `totalWeight(pkg: PackageDraft): number`
  - `matchTravelers(story: Story, pkg: PackageDraft): Traveler[]`
  - `initialState: DemoState`
  - `demoReducer(state: DemoState, action: DemoAction): DemoState`
  - `DemoProvider`
  - `useDemo(): { state: DemoState; story: Story | null; dispatch: (a: DemoAction) => void }`

**Sample data** (the spec's "Sample data" section; anything not listed here is the implementer's call):
- **Diaspora:**
  - Title: `Diaspora: Washington → Addis`, in USD.
  - Sender: Selam Tesfaye, Washington, DC, `selam@example.com`, `+251 9•• ••• 12`.
  - Package (Washington, DC → Addis Ababa, departure 2026-12-04, arrival 2026-12-05, reward 60):
    - Electronics, "Laptop", 2.2 kg
    - Other, "Medicine", 0.8 kg
  - Travelers:
    - Dawit Bekele: 4.9 stars, 23 trips, 8 kg spare, dateDiffDays 0
    - Hirut Alemu: 4.6 stars, 9 trips, 5 kg spare, dateDiffDays 1
    - Yonas Girma: 4.2 stars, 4 trips, 3.5 kg spare, dateDiffDays 3
- **Domestic:**
  - Title: `Domestic: Addis → Hawassa`, in ETB.
  - Sender: Meron Haile, Addis Ababa.
  - Package (Addis Ababa → Hawassa, departure 2026-12-06, arrival the same day, reward 600):
    - Documents, "Contracts", 0.5 kg
    - Clothing, "Dresses", 1.5 kg
  - Travelers:
    - Abebe Tadesse: 4.8 stars, 31 trips, 10 kg spare, dateDiffDays 0
    - Two others with lower scores.

- [ ] **Step 1: Write the failing tests.**
  ```ts
  // fees.test.ts
  expect(computeFees(60, 'USD')).toEqual({ reward: 60, fee: 6, tax: 5.28, total: 71.28 });
  expect(computeFees(600, 'ETB')).toEqual({ reward: 600, fee: 60, tax: 53, total: 713 });
  expect(formatMoney(71.28, 'USD')).toBe('$71.28');
  expect(formatMoney(713, 'ETB')).toBe('713 ETB');

  // matching.test.ts
  // 'ranks by date, then rating, then spare room'
  expect(matchTravelers(DIASPORA, DIASPORA.packageDraft).map(t => t.name))
    .toEqual(['Dawit Bekele', 'Hirut Alemu', 'Yonas Girma']);
  // 'drops travelers without room': a 4 kg package drops Yonas (3.5 kg); a 30 kg package → []
  ```
  `reducer.test.ts` is one `it` each:
  - **walks the diaspora story from start to done:** dispatch the happy path in order, switching views where the table requires. At the end, assert:
    - `step === 'done'`
    - `fees.total === 71.28`
    - both ratings are set
    - `messages` holds the seeded messages, plus a sent one, plus the canned reply
  - **ignores out-of-order actions:** `payEscrow` at `matches`, then `payEscrow` twice at `confirmed`. Assert `toBe(sameState)` the first time; the second pay is a no-op.
  - **ignores actions from the wrong view:** `acceptOffer` in the sender view.
  - **a wrong code sets codeError and stays on phone:** then the right code moves to `post` and clears `codeError`.
  - **rejects an empty or 2001-character message.**
  - **adds the canned reply only once.**
  - **ratings stay hidden until both have rated:** `finish` after one rating is ignored.
  - **restart clears everything:** after reaching `paid`, `restart` returns a state deep-equal to `initialState`.
  - **postTrip appends to trips and closes the panel.**
- [ ] **Step 2:** Run `npm test`. Expected: FAIL (the modules are missing).
- [ ] **Step 3:** Implement the files listed above with the signatures listed above.
  - `matchTravelers` filters on `spareKg >= totalWeight(pkg)` and sorts by `dateDiffDays` ascending, then `rating` descending, then `spareKg` descending.
  - Messages get ids from a counter and timestamps from `new Date().toISOString()`.
  - `DemoProvider` uses `useReducer(demoReducer, initialState)`.
- [ ] **Step 4:** Run `npm test`. Expected: all PASS.
- [ ] **Step 5:** Commit `feat(demo): stories, fees, matching and the demo reducer`.

### Task 2: Layout, guide, view switch and the start screen

**Files:**
- Create:
  - `src/components/DemoLayout.tsx`, `src/components/ViewSwitch.tsx`, `src/components/ui.tsx`
  - `src/demo/guide.ts`
  - `src/screens/ScreenRouter.tsx`, `src/screens/StartScreen.tsx`, `src/screens/SignUpScreen.tsx` (the sign-up form only)
- Modify: `src/app/page.tsx`
- Test: `tests/unit/guide.test.ts`, `tests/e2e/start.spec.ts`

**Interfaces:**
- Consumes: `useDemo` and the types.
- Produces:
  - `guideFor(state: DemoState, story: Story | null): { who: View | null; title: string; body: string; next: string }`
  - `ScreenRouter`: `panel` wins (chat → `ChatScreen`, postTrip → `PostTripScreen`). Otherwise it maps `(step, view)` to a screen. A step that has no screen yet renders `<Placeholder step=… />` until its task lands.
  - The UI parts:
    - `Button` (`variant: 'primary' | 'secondary'`)
    - `Card`
    - `Field` (label + input + error)
    - `StatusPill` (`tone: 'held' | 'released' | 'sent' | 'neutral'`)
    - `Stars` (read-only or input)

**Layout:**
- **At 768 px and wider:** a 390×844 rounded phone frame, centered, with the guide panel on its right showing `title`, `body` and `next`. The **Restart demo** button sits under the guide.
- **Below 768 px:** no frame. A sticky top banner shows `next`, and it also has Restart.
- **ViewSwitch:** a two-button switch inside the app header (`Sender · Selam` / `Traveler · Dawit`, names from the story). It shows only after the phone step, and the guide's `who` is highlighted on it.

- [ ] **Step 1: Write the failing tests.**
  - The guide unit tests:
    - at `offerSent` in the sender view, `who === 'traveler'` and `next` contains `Switch to Dawit`;
    - at `start`, `who === null`.
  - Extend the e2e:
    - **choosing Diaspora opens sign-up prefilled with Selam:** the name input has the value `Selam Tesfaye`;
    - **Restart returns to the start screen:** it works from both projects.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement the files listed above. Write each step's guide copy in plain, warm, short sentences, one per step from the spec's flow. The start cards show each story's `title` and `subtitle`, with Diaspora first.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit `feat(demo): layout, guide, view switch and start screen`.

### Task 3: Onboarding — sign up, simulated Fayda, phone code

**Files:**
- Create:
  - `src/screens/VerifyScreen.tsx` (including the simulated Fayda sheet)
  - `src/screens/PhoneScreen.tsx`
  - `tests/e2e/helpers.ts`, `tests/e2e/onboarding.spec.ts`
- Modify: `src/screens/SignUpScreen.tsx` (wire submit), `ScreenRouter.tsx`

**Interfaces:**
- Produces: `walkTo(page: Page, story: StoryId, step: Step): Promise<void>`. It drives the UI from `/` to `step` using visible buttons only. Each later task extends it with its own steps.

**The screens:**
- **VerifyScreen:**
  - The **Verify with Fayda** button opens a sheet titled `Demo — simulated Fayda sign-in`. The sheet shows a consent list (name, date of birth, phone) and an **Allow** button.
  - After **Allow**, a `Verified identity` tick, then the text `One more step: confirm your phone.` with **Continue**.
- **PhoneScreen:**
  - The text `We texted a code to {phoneMasked}`, and a six-digit input.
  - A hint, `Demo code: 482913`, with a **Fill code** button.
  - A wrong code shows `That code isn't right`.
  - When the code is right, the screen shows `Your account is active` and moves on.
- **SignUpScreen:** Continue is disabled while either field is empty after trimming.

- [ ] **Step 1: Write the failing e2e tests:**
  - **signs up, verifies with the simulated Fayda, confirms the phone:** ends on the post-package screen, and `Your account is active` was shown;
  - **a wrong code shows an error and stays:** typing `000000` shows `That code isn't right`;
  - **the Fayda sheet is labeled as a demo:** the text `Demo — simulated Fayda sign-in` is visible.
- [ ] **Step 2:** Run `npm run e2e`. Expected: FAIL.
- [ ] **Step 3:** Implement the screens above and `walkTo` up to `post`.
- [ ] **Step 4:** Run `npm run e2e`. Expected: PASS.
- [ ] **Step 5:** Commit `feat(demo): sign up, simulated Fayda and phone code`.

### Task 4: Post a package, matches, send an offer

**Files:**
- Create: `src/screens/PostPackageScreen.tsx`, `src/screens/MatchesScreen.tsx`, `tests/e2e/package.spec.ts`
- Modify: `ScreenRouter.tsx`, `tests/e2e/helpers.ts`

**The screens:**
- **PostPackageScreen:**
  - **Items:** prefilled from `story.packageDraft`. Each has a category select (the 7 categories), a description and a weight in kg. **Add item** is hidden once there are 3 items; **Remove** is hidden when only 1 is left.
  - **Route and dates:** shown read-only.
  - **Reward:** an editable field.
  - **Live total:** `Total weight: X kg`.
  - **Rules:**
    - Each weight must be > 0 and ≤ 30 kg (`Enter a weight between 0.1 and 30 kg`).
    - The reward must be > 0 (`Enter a reward`).
    - The description must not be empty.
    - Continue (`Find travelers`) is disabled while anything is invalid.
- **MatchesScreen:**
  - One card per `matchTravelers` result: the name, a `Verified` badge, `★ 4.9 · 23 trips`, the dates, `8 kg free`, and **Send offer**. The first card is marked `Best match`.
  - **When no one fits:** the text `No traveler has room for {X} kg on this route yet.`, with **Edit package** (→ `editPackage`).
  - **After Send offer:** the card shows a blue `Offer sent` pill, and the guide says to switch to the traveler.

- [ ] **Step 1: Write the failing e2e tests:**
  - **shows three ranked travelers with Dawit first:** the first card contains `Dawit Bekele` and `Best match`;
  - **no room → edit package:** setting the laptop weight to 30 shows `No traveler has room for 30.8 kg`; **Edit package** returns to the form with 30 still filled in;
  - **a weight of 0 blocks Find travelers;**
  - **sending an offer shows Offer sent.**
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement the screens above, and extend `walkTo` to `matches` and `offerSent`.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit `feat(demo): post a package, matches and offers`.

### Task 5: Traveler side, confirmation and escrow

**Files:**
- Create:
  - `src/screens/TravelerHomeScreen.tsx` (the trips list, the offers, and the **Post a trip** entry)
  - `src/screens/PostTripScreen.tsx`
  - `src/screens/EscrowScreen.tsx`
  - `tests/e2e/escrow.spec.ts`
- Modify: `ScreenRouter.tsx`, `helpers.ts`

**The screens:**
- **TravelerHomeScreen:**
  - **Before `offerSent`:** `Your trips` (from `state.trips`) and `No offers yet`.
  - **At `offerSent`:** an offer card with the sender's name, the items, the total weight, the reward (`formatMoney`) and **Accept**.
  - **After accepting:** `Waiting for Selam to confirm`.
- **PostTripScreen:** a form prefilled with the route, the next week's dates and a capacity of 10 kg. **Save** dispatches `postTrip`, and the new trip appears in the list.
- **EscrowScreen (sender view):**
  - **At `offerAccepted`:** `Dawit accepted` and **Confirm Dawit**.
  - **At `confirmed`:** a breakdown with these rows: Reward, Yizzo fee (10%), Tax (8%), Total. Then **Pay {total} into escrow**.
  - **At `paid` or later:** an amber `Held` pill and `Yizzo keeps the money until you confirm delivery.`

- [ ] **Step 1: Write the failing e2e tests:**
  - **traveler accepts, sender confirms and pays:** the Diaspora breakdown shows `$60.00`, `$6.00`, `$5.28` and `$71.28`, then `Held`;
  - **domestic shows birr:** the total is `713 ETB`;
  - **double-tapping Pay charges once:** after a `dblclick`, `Held` shows once and no error appears;
  - **a posted trip appears in Your trips.**
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement the screens above, and extend `walkTo` to `paid`.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit `feat(demo): traveler side, confirmation and escrow`.

### Task 6: Chat

**Files:**
- Create: `src/screens/ChatScreen.tsx`, `tests/e2e/chat.spec.ts`
- Modify: the sender's and traveler's screens from `offerSent` on, to add a **Message** button (`openPanel 'chat'`); `helpers.ts`

**The screen:**
- **Header:** the other party's name, and a back button (`closePanel`).
- **Messages:** bubbles, the current view's on the right.
- **Composer:** **Send** is disabled for blank text or anything over 2000 characters.
- The canned reply appears under the first sent message. A short "typing…" delay of about 800 ms is the implementer's call.
- **Seeded lines (diaspora):**
  - Dawit: `Hi Selam! I fly out Dec 4 from Dulles.`
  - Selam: `Great. Can you meet me near Bole on Friday?`
- **Canned reply:** `Sure, Bole works. I'll message when I land.`
- **Domestic:** similar lines, with Abebe in Addis and Hawassa.

- [ ] **Step 1: Write the failing e2e tests:**
  - **a sent message shows in the other view:** the sender sends `See you there`, switches to the traveler, opens chat, and the message is visible;
  - **the canned reply arrives once;**
  - **Send is disabled for spaces only.**
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement the chat screen and the Message buttons.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit `feat(demo): chat between sender and traveler`.

### Task 7: Delivery, release, ratings, done

**Files:**
- Create: `src/screens/DeliveryScreen.tsx`, `src/screens/RatingScreen.tsx`, `src/screens/DoneScreen.tsx`, `tests/e2e/finish.spec.ts`
- Modify: `ScreenRouter.tsx`, `helpers.ts`

**The screens:**
- **DeliveryScreen:**
  - A timeline: `Picked up` → `In transit` → `Delivered`.
  - **Traveler view:** one button that advances to the next state (`Mark picked up`, `Mark in transit`, `Mark delivered`).
  - **Sender view:** read-only until `delivered`, then **Confirm delivery**. That turns the green `Released` pill on and shows the split: `Dawit receives $60.00 · Yizzo fee $6.00`.
- **RatingScreen:**
  - Stars (1–5, required) and an optional review (up to 500 characters).
  - Once one side has rated: `Your rating is hidden until Dawit rates too.`
  - Once both have rated, both ratings are shown, with **See summary** (`finish`).
- **DoneScreen:**
  - A recap of what just happened.
  - Three one-line "also built" notes: disputes freeze escrow and admins resolve them; users report and admins take down content; the admin dashboard and audit log.
  - **Try the other story:** restart, then `chooseStory` with the other story.
  - **Restart demo.**

- [ ] **Step 1: Write the failing e2e tests:**
  - **traveler delivers, sender confirms, money is released:** the screen shows `Released` and `Dawit receives $60.00`;
  - **ratings are hidden until both have rated;**
  - **the done screen offers the other story:** tapping **Try the other story** lands on sign-up prefilled with `Meron Haile`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement the screens above, and extend `walkTo` to `done`.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit `feat(demo): delivery, release, ratings and summary`.

### Task 8: Full-flow tests and launch

**Files:**
- Create: `tests/e2e/full-flow.spec.ts`, `README.md`
- Modify: whatever the runs below turn up

- [ ] **Step 1: Write the tests.** One test per story, `the whole delivery, start to done`. Each walks every step through the visible UI (not `walkTo`) and asserts the key screens: active account, 3 matches, Held, Released, ratings revealed, Done. Also add `restart partway clears the delivery`: get to `paid`, Restart, choose the same story, walk to chat, and assert only the seeded messages are there.
- [ ] **Step 2:** Run `npm test && npm run e2e`. Expected: all PASS in both projects. Fix anything that doesn't.
- [ ] **Step 3: Manual pass.** In the browser pane, at the phone and laptop sizes, check:
  - nothing overflows horizontally;
  - every screen has a clear next tap;
  - the text is readable on the frame.
- [ ] **Step 4:** Write `README.md`: what it is, `npm run dev`, the tests, and how to deploy (import the repo on Vercel; the framework is detected and the output is static). Note that all the data is invented.
- [ ] **Step 5:** Run `npm run lint && npm run build`. Expected: clean.
- [ ] **Step 6:** Commit `test(demo): full-flow tests and README`.
- [ ] **Step 7 (the user):** create `Yizo-Delivery/yizzo-demo` on GitHub. Then push, import the repo on Vercel, and share the URL.
