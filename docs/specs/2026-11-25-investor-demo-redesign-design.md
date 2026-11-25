# Yizzo Investor Demo — Redesign

_2026-11-25. A new look and a few new screens for the live demo at https://yizzo-demo.vercel.app, based on a reference image from the user. It builds on [2026-11-15-investor-demo-design.md](2026-11-15-investor-demo-design.md). Everything in that spec still holds unless this one changes it._

## Intent

The demo already works from start to finish. But it looks like a prototype: green and yellow, text-only cards, and no home screen. The user wants something they can **show investors** that looks like a finished consumer app.

The user supplied a reference image with four phone screens: Welcome, Home, Send an Item, and Available Travelers. The demo gets that look, plus the screens from the image it doesn't have yet. The investor link stays the same, so links already shared keep working and show the new version.

The reference is the user's own design, so we follow it closely. The demo keeps everything the reference doesn't show: the Fayda check, the phone code, offers, escrow, chat, delivery, ratings, both sides of the marketplace, and the guide.

## Goals

- **The reference's look on every screen:**
  - deep navy and soft light blue, lots of white space, rounded cards;
  - the **Yizzo wordmark with a paper plane**;
  - the tagline **"People move the world closer."**
- **New screens from the reference:**
  - a photo **Welcome** screen;
  - a **Home** screen;
  - a **bottom tab bar**;
  - a **3-step Send an Item** form;
  - a restyled **Available Travelers** list with flags and the date range.
- **Each existing screen gets the new look** and keeps working as it does now: sign up, Fayda, phone code, escrow, chat, delivery, rating, done, the traveler's home, and post a trip.
- **The guided tour keeps working.** The guide panel on a laptop and the banner on a phone still say whose turn it is and what to tap. Both stories still run from start to finish.

## Non-goals

- No backend, logins or real payments (unchanged).
- **No new marketplace features.** These new parts are for show and don't change how a delivery works: item photos, item value, tabs and popular routes.
- **No filter or sort on the travelers list.** The reference shows a filter icon, but it's left out: a button that does nothing would be a dead end.
- **No "I already have an account" button.** The reference has one, but there is no returning user in the demo, so it would also be a dead end.
- English only (unchanged).

## Anti-goals (a failure even if it works)

- **Photos of people passed off as Yizzo users.** People only appear in the licensed stock photo on the Welcome screen. Travelers and senders get **initials avatars**, never photos.
- **Sample numbers read as real traction.** The only crowd number is **"50+ active travelers"** on each popular route, and it sits next to a visible **"Sample data"** label. The travelers list counts what the story really has ("3 travelers for your package"), so the two numbers never contradict each other.
- **A button or tab that does nothing.** Every visible control does something. If the reference shows a control we can't make work, it's left out (see Non-goals).
- **The guided flow breaks.** This covers new screens that strand the investor, or a guide that points at something not on screen.
- Anything from the old spec's anti-goals: copying CarryOn, a Fayda screen that could pass for the real one, or needing a server.

## Constraints

- Same stack, repository and deploy as before:
  - Next.js static export, Tailwind 4, TypeScript and lucide-react;
  - `Yizo-Delivery/yizzo-demo`, auto-deployed by Vercel on push to `main`. Pushing happens only when the user asks.
- **Images are bundled in the repository.** Nothing loads from outside at runtime, except Google Fonts through `next/font`, which self-hosts them at build time.
- **The welcome photo is a stock image the user is licensed to use commercially** (for example from Unsplash or Pexels). Until it arrives, the Welcome screen uses a navy gradient with the paper-plane mark, and the layout must look finished that way too. The photo goes in `public/welcome.jpg`. Add a credit line if its license asks for one.
- **Accessibility:**
  - Contrast passes WCAG AA, and tap targets are at least 44 px. Both are unchanged.
  - Navy text on light blue, and white text on navy, both pass. Light blue on white is for backgrounds only, never for text.
  - The existing focus handling stays: a new screen focuses its h1, and the Fayda sheet traps focus.
- The existing test suites (Vitest and Playwright, phone 390×844 and laptop 1440×900) are updated and stay green. Buttons keep the `disabled`-while-arming behavior the tests depend on.

## Approaches

1. **Restyle every screen, and add the reference's new screens (chosen).** Investors see the polished app from the image and can still tap through a whole delivery. Trade-off: the most work, and the flow, guide and tests change where the steps change.
2. **Restyle only.** Fast and low risk. Rejected: it lacks Home, the tab bar and the 3-step form, which are most of what makes the reference feel like a real app.
3. **Start over from the image.** The closest match to the picture. Rejected: it throws away a working flow, its checks and its tests, and the escrow, chat and delivery screens would have to be rebuilt.

The user chose **1**.

## Look

**Colors.** The existing color names are kept and their values replaced. Exact shades are the builder's call, close to these:

| Name | Use | Value |
|------|-----|-------|
| `brand` | navy: primary buttons, headings, active tab | about `#0B1F4B` |
| `brand-soft` | light blue: card fills, hero backgrounds | about `#E8F0FE` |
| `sky` (new) | mid blue: icons, the paper plane, small highlights | about `#3B82F6` |
| `accent` | star ratings only | gold, unchanged |
| `held`, `released`, `sent` | status pills | unchanged |

**Type.** One rounded geometric sans: **Plus Jakarta Sans** via `next/font/google`, in place of Inter. Headings are bold.

**Logo.** A small inline SVG: a paper plane next to "Yizzo" in navy. It's used on Welcome, in the app bar, and in the laptop guide panel.

**App bar** _(my call)_. There is one slim bar at the top of every screen after Welcome, as today:
- the logo on the left;
- the Sender/Traveler switch and "Message {name}" on the right.

On Home, the "Hi, {first name}" greeting and avatar sit just under this bar, as part of the page, not as a second header. The e2e helpers that tap the switch keep working.

**Shapes.** Cards are 20 px rounded with a soft shadow instead of a border. Primary buttons are navy and full width. Secondary buttons are white with a navy outline.

**Flags.** Inline SVG flag components for USA, UK, Canada and Ethiopia, not emoji: emoji flags don't render on Windows. They're decorative (`aria-hidden`), and the country names are always written out next to them.

**Avatars.** A circle with the person's initials, tinted from a small set of brand colors, chosen by name so it stays the same between renders.

## The flow (what changes)

`[S]` marks the sender's view and `[T]` the traveler's. Steps not listed here work exactly as they do today.

1. **Welcome** (the old Start screen):
   - It shows the photo (or the gradient until the photo arrives), the logo, the tagline, and one line on what Yizzo is.
   - There is a **Get Started** button.
   - Get Started opens a bottom sheet, "Pick a story", with the two story cards from today's Start screen. Choosing one starts sign-up.
   - "Demo with sample data" stays at the bottom.
2. **[S] Sign up, Fayda, phone code:** these get the new look and work as before.
3. **[S] Home (new step `home`, between `phone` and `post`):**
   - "Hi, {first name}" with the avatar, under the app bar.
   - Two big cards: **Send an Item** goes to the Send form. **Traveling Soon?** switches to the traveler's phone, whose home already has Post a trip.
   - **Popular routes:** one row per route, each with flags, the cities, and "50+ active travelers". There's a small "Sample data" label next to the heading. The rows are just information and can't be tapped.
     - Diaspora story: USA → Ethiopia, UK → Ethiopia, Canada → Ethiopia.
     - Domestic story: Addis Ababa → Hawassa, Addis Ababa → Bahir Dar, Addis Ababa → Dire Dawa, with Ethiopian flags on both ends.
   - **How Yizzo Works:** four numbered steps with icons:
     1. Post your item.
     2. Match with a verified traveler.
     3. Pay safely into escrow.
     4. Get it delivered and rate.
   - The guide says: "Tap Send an Item."
4. **[S] Send an Item (replaces Post a package):** one screen with a 3-step stepper at the top (**Item details → Preferences → Review**). The stepper's position is local screen state, kept with `useDraft` so it survives switching phones. The reducer doesn't change until the investor taps Find travelers.
   - **Item details**, for each item (one to three, as today):
     - photos;
     - item name (new, prefilled);
     - category (unchanged list);
     - weight, with a fixed "kg" unit label;
     - item value in the story's currency (new, prefilled, display only, not used in fees);
     - optional description.
     - "Add another item" stays.
     - **Next** checks this step's fields, using the existing validation.
   - **Photos:**
     - Each sample item comes with one bundled illustration (an object, not a person) in `public/items/`.
     - There is an "Add photo" tile. It opens the device's file picker and shows the picked image right away from a local object URL. Nothing is uploaded or saved, and a picked photo disappears on Restart.
     - Up to 3 photos per item.
   - **Preferences:** the route (from and to, prefilled and read-only as today), the preferred dates, and the reward. **Back** and **Next**.
   - **Review:**
     - a summary of the items with their thumbnails;
     - the route and dates;
     - the reward plus the fee and tax breakdown (existing `fees.ts`).
     - Back, and **Find travelers**, which dispatches `postPackage` as today.
   - **Edit package** from the travelers list comes back to the Item details step.
5. **[S] Available Travelers (the restyled Matches screen):**
   - A header with flags, "{origin} → {destination}", the package's date range, and "{n} travelers for your package".
   - **Each card has:**
     - the initials avatar, name and Verified tick;
     - stars, rating and number of reviews (uses the existing `trips` count);
     - the date range;
     - the route: airport codes for the diaspora story (IAD → ADD), cities and "by car" for the domestic story;
     - the free kilos;
     - "Best match" on the first card;
     - Send offer, unchanged.
   - The empty state (nobody has room) keeps today's message and Edit package.
6. **Offer, escrow, chat, delivery, rating and done:** these get the new look and keep today's flow and copy.
7. **[T] the traveler's side:** gets the new look. Its home gets the same header style ("Hi, {first name}").

### Bottom tab bar

- **When it shows:** on both phones, from `home` on. It's hidden on Welcome and the onboarding steps, inside the Send form, and inside chat.
- **The tabs:** Home, Search, a raised center **+**, Trips and Profile, with lucide icons and labels.
- **What each tab does.** Each tab opens a real screen; none is a placeholder.
  - **Home:** closes any open tab panel and returns to the screen for the current step. That's the Home screen while the step is `home`, otherwise whatever the flow is on (matches, escrow, delivery…). The tab is labeled Home either way.
  - **Search:** a panel listing the travelers on the story's route, using the same cards as Available Travelers but without Send offer.
    - Before a package is posted, it ends with "Post your item to send an offer", and a button that goes to Send an Item. On the traveler's phone, Search shows the story's one package once it has been posted (route, weight, reward). Before that, it says "No packages on your routes yet".
    - After a package is posted, the list just shows the travelers.
  - **+:** on the sender's phone, it goes to Send an Item while the step is `home`. After a package exists, it shows a short sheet, "One package at a time in the demo", with a button back to the current step. On the traveler's phone, it opens the existing Post a trip panel.
  - **Trips:** a panel with the current delivery's status (route, the other person, and a status pill using the existing held, released and sent colors), or "No deliveries yet" with a button to Send an Item. On the traveler's phone, it also lists the posted trips.
  - **Profile:** a panel with the avatar, name and email, a "Fayda verified" tick, a "Phone confirmed" tick, the rating once it's revealed, and **Restart demo**.
- **How panels work:** they use the existing `panel` mechanism. `Panel` gains `'search' | 'trips' | 'profile'`, each closed the same way. Opening a tab panel never changes `step`. The guide keeps describing the current step and adds "Tap Home to continue" while a tab panel is open.

## State (what changes)

- `Step` gains `home` after `phone`. `confirmPhone` now lands on `home`, and a new action `startSend` moves `home` to `post`. `reached()` order is updated to match.
- `Panel` gains `'search' | 'trips' | 'profile'`. Each must also be added to the reducer's `openPanel` checks.
- **`Item` gains these fields,** and the stories' sample items get them:
  - `name: string`;
  - `value: number`;
  - `photo: string`, a bundled image path.
- **Photos the investor picks** _(my call)_:
  - They live in a small photo store in `DemoProvider`, keyed by item, as object URLs.
  - They never enter the reducer, and `postPackage` doesn't clear them (unlike drafts). So they survive Find travelers and Edit package.
  - Every later screen that shows an item shows the picked photo if there is one, otherwise the bundled `Item.photo`. That includes the traveler's offer card, the Search package card, Trips, and the Edit form.
  - Object URLs are revoked when an item or photo is removed, and on Restart.
- **Switching phones starts at `home`** _(my call)_:
  - The gates on `switchView`, `ViewSwitch`, the banner's tap-to-switch, and opening `postTrip` move from `reached(state, 'post')` to `reached(state, 'home')`.
  - At `home`, the traveler's phone shows its home (no offers yet), with Post a trip and the tab bar working.
  - The guide's `home` entry still tells the investor to tap Send an Item on Selam's or Meron's phone.
- **The guide** gets a `home` entry. The `post` entry's action becomes "Check the item, tap Next twice, then Find travelers." Banner tap-to-switch and the laptop guide work as today.

## Testing

- **Unit:**
  - the reducer's new `home` step and `startSend`;
  - the tab panels open and close without changing `step`;
  - the guide's `home` entry and the open-panel hint;
  - the existing tests updated for `confirmPhone → home`.
- **e2e:**
  - The full-flow spec in both stories, at both sizes, now passes Home and the 3 Send steps.
  - **New checks:**
    - the Welcome sheet opens and picks a story;
    - each tab opens a screen and Home returns to the flow, at every stage the tab bar shows;
    - the stepper's Back and Next keep entered values;
    - an invalid weight stops Next on step 1;
    - "Sample data" is visible next to the popular routes;
    - no tab or button on any screen does nothing: each visible button, when tapped, changes the screen or the state.
  - The existing polish, scroll, focus, double-tap and reduced-motion specs stay green.
- **Manual:** check the deployed Vercel preview by eye at both sizes, with and without the welcome photo.

## Left to the builder

- Exact color shades, shadows, spacing and icon choices, within the Look section.
- The sample item names, values and illustrations. Illustrations can be simple inline-SVG-style images made for this repository, or the license-clear set the builder finds. Note the source in `public/items/README.md`.
- The copy for the new screens, in the existing tone: plain, warm and short.
- Whether the stepper is one component with three parts or three components.
- How the Welcome sheet animates. It should be subtle and respect reduced motion.

## What the user does

- Send the licensed stock photo for the Welcome screen, and any credit line its license requires.
- Review the result on a Vercel preview, and say when to push to `main` (that updates the live link).
