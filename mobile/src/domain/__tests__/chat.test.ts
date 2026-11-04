import { OFFER_STATUS, QUICK_REPLIES, priceStep } from '../chat';

describe('chat words and offers', () => {
  test('quick replies for both sides', () => {
    expect(QUICK_REPLIES.buyer.length).toBeGreaterThan(0);
    expect(QUICK_REPLIES.seller.length).toBeGreaterThan(0);
  });

  test('every offer state reads from both sides', () => {
    for (const s of ['pending', 'accepted', 'rejected', 'countered', 'withdrawn'] as const) {
      expect(OFFER_STATUS[s].mine).toBeTruthy();
      expect(OFFER_STATUS[s].theirs).toBeTruthy();
    }
  });

  test('quick discounts round to a sensible step', () => {
    expect(priceStep(685000)).toBe(5000);
    expect(priceStep(220)).toBe(10);
    expect(priceStep(4.5)).toBe(0.5);
  });
});
