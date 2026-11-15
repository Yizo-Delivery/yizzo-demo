# Yizzo Investor Demo — Design

_2026-11-15. A clickable demo of the Yizzo app for investors, hosted on Vercel._

## Intent

Investors should be able to *use* Yizzo, not just read about it. Fayda onboarding, an SMS provider and hosting aren't ready yet, so the real system can't go online. This demo shows the product working end to end on sample data. It needs no accounts and no servers, and it behaves the same at every pitch.

The reference is [CarryOn](https://carryonapp.com/), a peer-to-peer courier where travelers carry packages across borders. We borrow its idea only, never its name, copy, images or look. CarryOn's site is a marketing page; ours is a working app.

## Goals

- An investor opens one link and taps through a whole delivery: verify, post a package, get matched, agree, chat, pay into escrow, deliver, get paid, rate.
- Show **both sides of the marketplace**: a switch moves between the sender's and the traveler's view of the same delivery.
- **Two stories:**
  - **Diaspora (default):** a sender in Washington, DC sends a package to family in Addis Ababa with a traveler flying IAD → ADD. Prices are in US dollars.
  - **Domestic (second):** a sender in Addis sends to Hawassa with a traveler driving down. Prices are in birr (ETB).
- **Show only what the backend really does,** so the demo never promises something that isn't built. The flows, rules and numbers follow `MVP_STATUS.md`.
- **Fit anywhere:** on a laptop, the app sits in a phone frame beside a short "what you're seeing" guide. On a phone, it fills the screen.

## Non-goals

- No backend, logins, database or real payments. State lives in memory; reloading the page or pressing **Restart demo** starts over.
- **Admin dashboard, disputes and reports are out of the tapped flow.** The guide mentions them in one line each, as built features.
- Push notifications, phone changes, account recovery and manual review are out.
- **English only.** Amharic comes later.
- **Not the real app's codebase.** The screens may later guide the real app's design, but the code isn't meant to be reused.

## Anti-goals (a failure even if it works)

- **It looks like CarryOn:** their name, wording, photos, colors or layout.
- **Sample content passed off as real:** fake traction numbers ("10,000 users"), or a Fayda screen that could be mistaken for the real government service. The Fayda step is labeled "Demo — simulated Fayda sign-in" and uses no official logo.
- **The flow can break or dead-end mid-pitch.** From any screen there's a clear next tap, and Restart always works.
- **It needs a login, a server, or anything else that can go down.**

## Constraints

- **Stack:** Next.js (App Router) + TypeScript + Tailwind CSS, exported as a static site and deployed on Vercel's free plan.
- **Its own folder and repository:** `/Users/mw/yizzo-demo` locally, and `Yizo-Delivery/yizzo-demo` on GitHub. The user creates the GitHub repository and connects Vercel to it.
- **No outside services at runtime:** no analytics, no external fonts beyond Google Fonts, and images bundled in the repository.
- **Accessible:** readable contrast, and every tap target at least 44 px.

## Approaches

1. **A static web app on Vercel with built-in sample data (chosen).** Interactive and reliable, and it can be sent as a link. Trade-off: about a week of work, and it isn't connected to the real backend.
2. **A clickable Figma prototype.** Quick to restyle. Rejected: every screen has to be hand-designed, and nothing reacts to what the investor types, so it feels like a slideshow.
3. **A real app connected to a hosted backend.** It shows real data. Rejected for now: it costs hosting money, takes weeks to build, and a server problem could break the pitch.

The user chose **1**.

## The flow

There is one delivery per story. `[S]` marks the sender's view and `[T]` the traveler's. The guide panel on a laptop, or a small banner on a phone, always says whose view is shown and what to do next. Tapping the banner switches views.

1. **Start screen:** the Yizzo wordmark, one line on what it is, and two cards: **Diaspora: Washington → Addis** (the default, shown first) and **Domestic: Addis → Hawassa**.
2. **[S] Sign up:** name and email, prefilled with sample values (the sender is Selam in the diaspora story and Meron in the domestic one; travelers below).
3. **[S] Verify identity:** a "Verify with Fayda" button opens the simulated sign-in, which shows the consent screen, then returns with a *Verified identity* tick. As in the backend, the account stays inactive until the phone is confirmed too.
4. **[S] Confirm phone:** "We texted a code to +251 9•• ••• 12". The six-digit code shows in a demo hint, and the investor types it in or taps to fill it. The account is now active.
5. **[S] Post a package:**
   - one to three items, each with a category (from the backend's: Documents, Package, Clothing, Fragile, Food, Electronics, Other) and a weight;
   - the route, the preferred dates and an offered reward, all prefilled.
   - The investor can change any field, and the totals update.
6. **[S] Matches:** three travelers ranked as the backend ranks them: route, then date, rating and spare capacity. Each card shows a *Verified* badge, the star rating and number of trips, the travel dates and the spare kilograms. One traveler is clearly the best match: Dawit in the diaspora story, Abebe in the domestic one.
7. **[S] Send an offer** to the top traveler. The status shows "Offer sent".
8. **[T] Switch to the traveler:**
   - the traveler's trip;
   - a new offer with the package details and the reward;
   - **Accept**.
9. **[S] Confirm the traveler,** then **Pay into escrow:** the reward, plus Yizzo's fee (10%), plus tax (8% of reward plus fee), adding up to the total. The status is **Held: Yizzo keeps the money until you confirm delivery.**
10. **[S/T] Chat:** a conversation with a few seeded messages ("Can you meet me near Bole on Friday?"). The investor can send a message; it appears in the other view, and there's one canned reply.
11. **[T] Mark delivered:** a timeline shows Picked up → In transit → Delivered.
12. **[S] Confirm delivery:** escrow is **Released**. The traveler receives the full reward; Yizzo keeps its fee. The screen shows that split, because it's Yizzo's revenue model. The fee and tax rates are the backend's defaults (`PLATFORM_FEE_PERCENT=10`, `TAX_RATE=8`); this was my call.
13. **Rate each other:** both sides give stars and an optional review. The ratings show "hidden until both have rated", then are revealed together, as in the backend.
14. **Done screen:**
    - a short recap of what just happened;
    - one line each on what's built but not shown: disputes freeze escrow, admins resolve them, users can report and admins take down content;
    - **Try the other story** and **Restart demo** buttons.

A traveler's **Post a trip** form is a side screen on the traveler's home, filled in and saveable. The new trip shows in the traveler's list. It isn't on the main path.

## Sample data

- **Diaspora:**
  - The sender is Selam, in Washington, DC.
  - Travelers on the IAD → ADD route: Dawit (4.9 stars, 23 trips, 8 kg spare) and two others with lower scores.
  - The package is a laptop and medicine, about 3 kg, with a $60 reward.
- **Domestic:**
  - The sender is Meron, in Addis.
  - Travelers on the Addis → Hawassa route: Abebe (4.8 stars) and two others.
  - The package is documents and clothing, about 2 kg, with a 600 ETB reward.
- All names, people and numbers are invented. The start screen's footer says "Demo with sample data".

## Look

- **The Yizzo name as a text wordmark,** since no logo exists yet.
- **Colors (builder's call):** a deep green primary and a warm yellow accent on a light background.
- Clean cards and plenty of white space.
- One sans-serif typeface (Inter).
- Status colors: held is amber, released is green, offer sent is blue.

## State

- One store holds the current story, which view is shown, the progress step, the package, offers, messages, the escrow status and ratings. It is built on React context with a reducer, and its actions match the flow's steps.
- Each story's sample data is a plain TypeScript file.
- Nothing is saved between page loads, and Restart resets the store.

## Testing

- **A Playwright test** taps through the whole flow in both stories, at a phone size and a laptop size, and checks that each key screen appears: the active account, the three matches, held, released and revealed ratings.
- **Unit tests** cover the fee math (reward + 10% + 8% tax, rounded to cents or whole birr) and the reducer's step transitions.
- **Every Vercel preview deploy** gets a quick manual run-through.

## Left to the builder

- Exact copy for each screen, within the tone above: plain, warm and short.
- Component structure, icons (from one icon set, e.g. Lucide), and transitions, which should be subtle.
- The names and scores of the lower-ranked travelers, and the seeded chat lines.

## What the user does

- Create the `Yizo-Delivery/yizzo-demo` repository on GitHub.
- Sign in to Vercel with GitHub and import the repository; Vercel then deploys every push.
- Optional: a custom domain such as `demo.yizzo.et`.
