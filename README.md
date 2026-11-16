# Yizzo — investor demo

A clickable demo of Yizzo, peer-to-peer package delivery for Ethiopia. An investor opens one link and follows a single delivery from both sides:

1. The sender signs up, verifies with a **simulated** Fayda sign-in, and confirms a phone code.
2. She posts a package, sees ranked, verified travelers, and sends an offer.
3. The traveler accepts. The sender confirms him and pays into escrow (reward + 10% Yizzo fee + 8% tax), where the money is **held**.
4. They chat. The traveler marks the package picked up, in transit and delivered.
5. The sender confirms delivery. The money is **released**: the traveler gets the reward and Yizzo keeps its fee.
6. They rate each other. The ratings stay hidden until both have rated.

There are two stories:
- **Diaspora:** Washington → Addis, in US dollars.
- **Domestic:** Addis → Hawassa, in birr.

A switch flips between the sender's phone and the traveler's. On a laptop, a guide beside the phone explains each step; on a phone, a banner on top gives the next tap.

**Everything is sample data.** Every person, number and message is invented. There is no backend, no login and no storage: the demo lives in memory, and reloading or pressing **Restart demo** starts over. The Fayda screen is labeled as a simulation and is not the real service.

The real backend is in [`Yizo-Delivery/backend`](https://github.com/Yizo-Delivery/backend). The flows, rules and fee rates here follow what it implements.

## Running it

Requires Node 24.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Tests

```bash
npm test          # unit tests (Vitest): fees, matching, the demo's state, the guide, dates
npm run e2e       # browser tests (Playwright) at a phone size and a laptop size
```

The first browser run needs Chromium:

```bash
npx playwright install chromium
```

`npm run e2e` builds the static site and tests that build, so it checks what Vercel serves.

## Deploying on Vercel

The app is a static export (`output: "export"` in `next.config.ts`): `npm run build` writes plain files to `out/`, and no server is needed.

1. Push this repository to GitHub (`Yizo-Delivery/yizzo-demo`).
2. On [vercel.com](https://vercel.com), sign in with GitHub, choose **Add New → Project**, and import the repository. Vercel detects Next.js; keep the defaults.
3. **Deploy.** Every later push to `main` redeploys, and pull requests get their own preview link.

To use a custom domain such as `demo.yizzo.et`, add it under the project's **Settings → Domains**.

## Where things are

| Path | What it holds |
|---|---|
| `src/demo/` | The logic, with no UI: `stories.ts` (sample data), `fees.ts`, `matching.ts`, `reducer.ts` (every step and what's allowed when), `guide.ts` (the guide's copy) |
| `src/screens/` | One file per screen; `ScreenRouter.tsx` picks the screen from the step and whose phone is shown |
| `src/components/` | The phone frame and guide (`DemoLayout.tsx`), the sender/traveler switch, and shared UI parts |
| `tests/unit/`, `tests/e2e/` | The tests; `tests/e2e/helpers.ts` has `walkTo`, which taps through to any step |
| `docs/` | The design and the implementation plan |
