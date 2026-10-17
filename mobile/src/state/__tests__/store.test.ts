import { createAppStore } from '../store';

const NOW = new Date(2026, 9, 16, 15, 20);

describe('app store', () => {
  test('history starts with the four demo scans, newest first', () => {
    const s = createAppStore(NOW).getState();
    expect(s.scans.map((x) => x.scenarioId)).toEqual(['bugday-pas', 'kuru-misir', 'aycicegi', 'domates-mildiyo']);
    expect(new Date(s.scans[0].date).getTime()).toBeGreaterThan(new Date(s.scans[1].date).getTime());
  });

  test('addScan puts the new scan first and returns its id', () => {
    const store = createAppStore(NOW);
    const id = store.getState().addScan({ scenarioId: 'aycicegi', photo: 'file:///x.jpg' }, NOW);
    expect(store.getState().scans[0]).toMatchObject({ id, scenarioId: 'aycicegi', photo: 'file:///x.jpg', date: NOW.toISOString() });
  });



  test('setSuggestion and setTask set a tick to a given value, repeat-safe', () => {
    const store = createAppStore(NOW);
    const id = store.getState().scans[0].id;
    store.getState().setSuggestion(id, 2, true);
    store.getState().setSuggestion(id, 2, true);
    expect(store.getState().doneSuggestions[id]).toEqual([2]);
    store.getState().setSuggestion(id, 2, false);
    expect(store.getState().doneSuggestions[id]).toEqual([]);
    store.getState().setTask('2026-10-16:Buğday ekimi', true);
    store.getState().setTask('2026-10-16:Buğday ekimi', true);
    expect(store.getState().doneTasks).toEqual(['2026-10-16:Buğday ekimi']);
    store.getState().setTask('2026-10-16:Buğday ekimi', false);
    expect(store.getState().doneTasks).toEqual([]);
  });
});

describe('market and messages', () => {
  const draft = { title: 'Az kullanılmış römork', category: 'ekipman' as const, condition: 'ikinci-el' as const, price: '145.000', unit: '', quantity: '', location: 'Merkez, Konya', description: 'Sağlam.', negotiable: true, photos: [] };

  test('toggleFavorite adds and removes', () => {
    const store = createAppStore(NOW);
    store.getState().toggleFavorite('l-traktor');
    expect(store.getState().favorites).toEqual(['l-traktor']);
    store.getState().toggleFavorite('l-traktor');
    expect(store.getState().favorites).toEqual([]);
  });

  test('addListing saves my listing first and returns its id', () => {
    const store = createAppStore(NOW);
    const id = store.getState().addListing(draft, NOW);
    expect(store.getState().myListings[0]).toMatchObject({ id, title: 'Az kullanılmış römork', price: 145000, sellerId: 'me', postedAt: NOW.toISOString() });
  });

  test('setListingStatus marks sold or removed, and null undoes it', () => {
    const store = createAppStore(NOW);
    store.getState().setListingStatus('l-sirt-pompasi', 'sold');
    expect(store.getState().listingStatus['l-sirt-pompasi']).toBe('sold');
    store.getState().setListingStatus('l-sirt-pompasi', null);
    expect(store.getState().listingStatus['l-sirt-pompasi']).toBeUndefined();
  });

  test('the inbox starts with the sample chats', () => {
    expect(createAppStore(NOW).getState().conversations.map((c) => c.id)).toEqual(['c-sirt-pompasi', 'c-domates', 'c-traktor']);
  });

  test('openConversation reuses the chat for a listing, or starts one with its seller', () => {
    const store = createAppStore(NOW);
    expect(store.getState().openConversation('l-traktor')).toBe('c-traktor');
    const id = store.getState().openConversation('l-mibzer');
    expect(store.getState().conversations.find((c) => c.id === id)).toMatchObject({ listingId: 'l-mibzer', peerId: 's-mustafa', role: 'buyer', messages: [] });
    expect(store.getState().openConversation('l-mibzer')).toBe(id);
  });

  test('sendText adds my message; deliverReply adds the scripted answer', () => {
    const store = createAppStore(NOW);
    const id = store.getState().openConversation('l-mibzer');
    store.getState().sendText(id, 'Nerede görebilirim?', NOW);
    store.getState().deliverReply(id, NOW);
    const msgs = store.getState().conversations.find((c) => c.id === id)!.messages;
    expect(msgs.map((m) => m.from)).toEqual(['me', 'them']);
    expect(msgs[1].text).toContain('Karatay');
  });

  test('an offer in between gets countered; accepting the counter closes the deal', () => {
    const store = createAppStore(NOW);
    const id = store.getState().openConversation('l-mibzer'); // 165.000 ₺
    store.getState().sendOffer(id, 130000, NOW);
    store.getState().deliverReply(id, NOW);
    let msgs = store.getState().conversations.find((c) => c.id === id)!.messages;
    expect(msgs[0].offer).toEqual({ amount: 130000, status: 'countered' });
    expect(msgs[1].offer).toEqual({ amount: 150000, status: 'pending' }); // halfway 147.500, to the 5.000 ₺ step
    store.getState().answerOffer(id, msgs[1].id, true, NOW);
    store.getState().deliverReply(id, NOW);
    msgs = store.getState().conversations.find((c) => c.id === id)!.messages;
    expect(msgs[1].offer?.status).toBe('accepted');
    expect(msgs[2].text).toMatch(/anlaştık/i);
  });

  test('a good offer is accepted outright', () => {
    const store = createAppStore(NOW);
    const id = store.getState().openConversation('l-mibzer');
    store.getState().sendOffer(id, 160000, NOW);
    store.getState().deliverReply(id, NOW);
    const msgs = store.getState().conversations.find((c) => c.id === id)!.messages;
    expect(msgs[0].offer?.status).toBe('accepted');
    expect(msgs[1].text).toMatch(/anlaştık/i);
  });

  test('deliverReply does nothing when the last word is already theirs', () => {
    const store = createAppStore(NOW);
    store.getState().deliverReply('c-domates', NOW);
    expect(store.getState().conversations.find((c) => c.id === 'c-domates')!.messages).toHaveLength(2);
  });

  test('markRead clears the unread count', () => {
    const store = createAppStore(NOW);
    expect(store.getState().unreadChats()).toBe(2);
    store.getState().markRead('c-sirt-pompasi', NOW);
    expect(store.getState().unreadChats()).toBe(1);
  });
});
