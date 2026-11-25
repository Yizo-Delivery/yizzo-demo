import { describe, expect, it } from 'vitest';
import { demoReducer, initialState } from '@/demo/reducer';
import { DIASPORA } from '@/demo/stories';
import { TAB_PANELS, type DemoAction, type DemoState } from '@/demo/types';

const AT = '2026-12-04T09:30:00.000Z';

const run = (actions: DemoAction[], from: DemoState = initialState) => actions.reduce(demoReducer, from);

const toHome: DemoAction[] = [
  { type: 'chooseStory', story: 'diaspora' },
  { type: 'signUp', name: 'Selam Tesfaye', email: 'selam@example.com' },
  { type: 'verifyIdentity' },
  { type: 'confirmPhone', code: '482913' },
];
const toPost: DemoAction[] = [...toHome, { type: 'startSend' }];
const toConfirmed: DemoAction[] = [
  ...toPost,
  { type: 'postPackage', pkg: DIASPORA.packageDraft },
  { type: 'sendOffer', travelerId: DIASPORA.travelers[0].id },
  { type: 'switchView', view: 'traveler' },
  { type: 'acceptOffer' },
  { type: 'switchView', view: 'sender' },
  { type: 'confirmTraveler' },
];
const toPaid: DemoAction[] = [...toConfirmed, { type: 'payEscrow' }];

describe('demoReducer', () => {
  it('walks the diaspora story from start to done', () => {
    const done = run([
      ...toPaid,
      { type: 'openPanel', panel: 'chat' },
      { type: 'sendMessage', at: AT, text: 'See you there' },
      { type: 'closePanel' },
      { type: 'switchView', view: 'traveler' },
      { type: 'advanceDelivery', from: 'paid' },
      { type: 'advanceDelivery', from: 'pickedUp' },
      { type: 'advanceDelivery', from: 'inTransit' },
      { type: 'switchView', view: 'sender' },
      { type: 'confirmDelivery' },
      { type: 'rate', rating: { stars: 5, review: 'Smooth and on time' } },
      { type: 'switchView', view: 'traveler' },
      { type: 'rate', rating: { stars: 5 } },
      { type: 'finish' },
    ]);

    expect(done.step).toBe('done');
    expect(done.account).toEqual({ name: 'Selam Tesfaye', email: 'selam@example.com' });
    expect(done.identityVerified && done.phoneVerified).toBe(true);
    expect(done.chosenTravelerId).toBe(DIASPORA.travelers[0].id);
    expect(done.fees?.total).toBe(71.28);
    expect(done.ratings.sender?.stars).toBe(5);
    expect(done.ratings.traveler?.stars).toBe(5);
    expect(done.messages.map((m) => m.text)).toEqual([
      ...DIASPORA.seededMessages.map((m) => m.text),
      'See you there',
      DIASPORA.cannedReply,
    ]);
  });

  it('ignores out-of-order actions', () => {
    const atMatches = run([...toPost, { type: 'postPackage', pkg: DIASPORA.packageDraft }]);
    expect(demoReducer(atMatches, { type: 'payEscrow' })).toBe(atMatches);

    const paid = run(toPaid);
    expect(paid.step).toBe('paid');
    expect(demoReducer(paid, { type: 'payEscrow' })).toBe(paid);
  });

  it('a repeated delivery step moves the package only once', () => {
    const traveling = run([...toPaid, { type: 'switchView', view: 'traveler' }]);
    const once = demoReducer(traveling, { type: 'advanceDelivery', from: 'paid' });
    expect(once.step).toBe('pickedUp');
    expect(demoReducer(once, { type: 'advanceDelivery', from: 'paid' })).toBe(once);
  });

  it('ignores actions from the wrong view', () => {
    const offerSent = run(toConfirmed.slice(0, toPost.length + 2));
    expect(offerSent.step).toBe('offerSent');
    expect(offerSent.view).toBe('sender');
    expect(demoReducer(offerSent, { type: 'acceptOffer' })).toBe(offerSent);
  });

  it('a wrong code sets codeError and stays on phone', () => {
    const atPhone = run(toPost.slice(0, 3));
    const wrong = demoReducer(atPhone, { type: 'confirmPhone', code: '000000' });
    expect(wrong.step).toBe('phone');
    expect(wrong.codeError).toBe(true);
    expect(wrong.phoneVerified).toBe(false);

    const right = demoReducer(wrong, { type: 'confirmPhone', code: '482913' });
    expect(right.step).toBe('home');
    expect(right.codeError).toBe(false);
    expect(right.phoneVerified).toBe(true);
  });

  it('rejects an invalid package', () => {
    const atPost = run(toPost);
    const bad = { ...DIASPORA.packageDraft, reward: 0 };
    expect(demoReducer(atPost, { type: 'postPackage', pkg: bad })).toBe(atPost);
  });

  it('only sends offers to travelers who have room', () => {
    const heavy = {
      ...DIASPORA.packageDraft,
      items: [{ ...DIASPORA.packageDraft.items[0], weightKg: 7 }],
    };
    const atMatches = run([...toPost, { type: 'postPackage', pkg: heavy }]);
    const yonas = DIASPORA.travelers[2].id; // 3.5 kg free
    expect(demoReducer(atMatches, { type: 'sendOffer', travelerId: yonas })).toBe(atMatches);
  });

  it('an offer gives the traveler view that traveler’s own trip', () => {
    const atMatches = run([...toPost, { type: 'postPackage', pkg: DIASPORA.packageDraft }]);
    const toDawit = demoReducer(atMatches, { type: 'sendOffer', travelerId: 'dawit' });
    expect(toDawit.trips).toEqual(DIASPORA.travelerTrips);

    const toHirut = demoReducer(atMatches, { type: 'sendOffer', travelerId: 'hirut' });
    expect(toHirut.trips).toEqual([
      {
        origin: 'Washington, DC',
        destination: 'Addis Ababa',
        departure: '2026-12-05',
        arrival: '2026-12-06',
        capacityKg: 5,
      },
    ]);
  });

  it('edit package goes back to the form and keeps the package', () => {
    const atMatches = run([...toPost, { type: 'postPackage', pkg: DIASPORA.packageDraft }]);
    const editing = demoReducer(atMatches, { type: 'editPackage' });
    expect(editing.step).toBe('post');
    expect(editing.pkg).toEqual(DIASPORA.packageDraft);
  });

  it('rejects an empty or 2001-character message', () => {
    const chatting = run([...toPaid, { type: 'openPanel', panel: 'chat' }]);
    expect(demoReducer(chatting, { type: 'sendMessage', at: AT, text: '   ' })).toBe(chatting);
    expect(demoReducer(chatting, { type: 'sendMessage', at: AT, text: 'x'.repeat(2001) })).toBe(chatting);
    expect(demoReducer(chatting, { type: 'sendMessage', at: AT, text: 'x'.repeat(2000) }).messages).toHaveLength(
      chatting.messages.length + 2,
    );
  });

  it('stamps messages with the time the action carries', () => {
    const chatting = run([...toPaid, { type: 'openPanel', panel: 'chat' }, { type: 'sendMessage', at: AT, text: 'Hi' }]);
    expect(chatting.messages.slice(-2).map((m) => m.at)).toEqual([AT, AT]);
  });

  it('adds the canned reply only once', () => {
    const chatting = run([
      ...toPaid,
      { type: 'openPanel', panel: 'chat' },
      { type: 'sendMessage', at: AT, text: 'First' },
      { type: 'sendMessage', at: AT, text: 'Second' },
    ]);
    expect(chatting.messages.filter((m) => m.text === DIASPORA.cannedReply)).toHaveLength(1);
    expect(chatting.messages.at(-1)?.text).toBe('Second');
  });

  it('ratings stay hidden until both have rated', () => {
    const released = run([
      ...toPaid,
      { type: 'switchView', view: 'traveler' },
      { type: 'advanceDelivery', from: 'paid' },
      { type: 'advanceDelivery', from: 'pickedUp' },
      { type: 'advanceDelivery', from: 'inTransit' },
      { type: 'switchView', view: 'sender' },
      { type: 'confirmDelivery' },
    ]);
    expect(released.step).toBe('released');

    const oneRated = demoReducer(released, { type: 'rate', rating: { stars: 4 } });
    expect(oneRated.step).toBe('rating');
    expect(demoReducer(oneRated, { type: 'finish' })).toBe(oneRated);
    // A second rating from the same side is ignored
    expect(demoReducer(oneRated, { type: 'rate', rating: { stars: 1 } })).toBe(oneRated);
  });

  it('restart clears everything', () => {
    const paid = run([...toPaid, { type: 'openPanel', panel: 'chat' }]);
    expect(demoReducer(paid, { type: 'restart' })).toEqual(initialState);
  });

  it('postTrip appends to trips and closes the panel', () => {
    const atPost = run([...toPost, { type: 'switchView', view: 'traveler' }]);
    const open = demoReducer(atPost, { type: 'openPanel', panel: 'postTrip' });
    expect(open.panel).toBe('postTrip');

    const trip = {
      origin: 'Washington, DC',
      destination: 'Addis Ababa',
      departure: '2026-12-18',
      arrival: '2026-12-19',
      capacityKg: 10,
    };
    const saved = demoReducer(open, { type: 'postTrip', trip });
    expect(saved.trips).toEqual([...DIASPORA.travelerTrips, trip]);
    expect(saved.panel).toBeNull();
  });

  it('the sender cannot open the trip form, and nobody can switch views before the phone is confirmed', () => {
    const atPost = run(toPost);
    expect(demoReducer(atPost, { type: 'openPanel', panel: 'postTrip' })).toBe(atPost);

    const atVerify = run(toPost.slice(0, 2));
    expect(demoReducer(atVerify, { type: 'switchView', view: 'traveler' })).toBe(atVerify);
  });

  it('confirmPhone with the right code lands on home', () => {
    const home = run(toHome);
    expect(home.step).toBe('home');
    expect(home.phoneVerified).toBe(true);
  });

  it('startSend moves home to post, and is ignored anywhere else', () => {
    const home = run(toHome);
    expect(demoReducer(home, { type: 'startSend' }).step).toBe('post');
    const post = run(toPost);
    expect(demoReducer(post, { type: 'startSend' })).toBe(post);
    const travelerHome = demoReducer(home, { type: 'switchView', view: 'traveler' });
    expect(demoReducer(travelerHome, { type: 'startSend' })).toBe(travelerHome);
  });

  it('switching views opens at home', () => {
    const home = run(toHome);
    expect(demoReducer(home, { type: 'switchView', view: 'traveler' }).view).toBe('traveler');
    const phone = run(toHome.slice(0, 3));
    expect(phone.step).toBe('phone');
    expect(demoReducer(phone, { type: 'switchView', view: 'traveler' })).toBe(phone);
  });

  it('the traveler can open Post a trip from home', () => {
    const traveler = run([...toHome, { type: 'switchView', view: 'traveler' }]);
    expect(demoReducer(traveler, { type: 'openPanel', panel: 'postTrip' }).panel).toBe('postTrip');
  });

  it('tab panels open from home on either phone, and never change step', () => {
    const home = run(toHome);
    const paid = run(toPaid);
    const travelerHome = demoReducer(home, { type: 'switchView', view: 'traveler' });
    const phone = run(toHome.slice(0, 3));
    for (const panel of TAB_PANELS) {
      for (const from of [home, paid, travelerHome]) {
        const open = demoReducer(from, { type: 'openPanel', panel });
        expect(open.panel).toBe(panel);
        expect(open.step).toBe(from.step);
      }
      expect(demoReducer(phone, { type: 'openPanel', panel })).toBe(phone);
    }
  });

  it('switchView closes a tab panel', () => {
    const trips = demoReducer(run(toHome), { type: 'openPanel', panel: 'trips' });
    const switched = demoReducer(trips, { type: 'switchView', view: 'traveler' });
    expect(switched.panel).toBeNull();
  });

  it('startSend closes an open tab panel', () => {
    const search = demoReducer(run(toHome), { type: 'openPanel', panel: 'search' });
    const post = demoReducer(search, { type: 'startSend' });
    expect(post.step).toBe('post');
    expect(post.panel).toBeNull();
  });
});
