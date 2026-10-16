import { SCENARIOS, answerFor, pickScenario, scenarioById, successTone } from '../scenarios';

describe('demo scenarios (from the website demo)', () => {
  test('the four website scenarios, each with a diagnosis, suggestions and chat questions', () => {
    expect(SCENARIOS.map((s) => s.id)).toEqual(['bugday-pas', 'kuru-misir', 'aycicegi', 'domates-mildiyo']);
    for (const s of SCENARIOS) {
      expect(s.diagnosis.length).toBeGreaterThan(10);
      expect(s.suggestions.length).toBeGreaterThan(0);
      expect(s.questions.length).toBeGreaterThan(0);
      expect(s.successRate).toBeGreaterThanOrEqual(0);
      expect(s.successRate).toBeLessThanOrEqual(100);
    }
  });

  test('scenarioById finds a scenario', () => {
    expect(scenarioById('aycicegi')?.title).toBe('Ayçiçeği tarlası');
    expect(scenarioById('nope')).toBeUndefined();
  });

  test('pickScenario gives the same scenario for the same photo', () => {
    expect(pickScenario('file:///a.jpg')).toBe(pickScenario('file:///a.jpg'));
    const ids = new Set(Array.from({ length: 20 }, (_, i) => pickScenario(`p${i}`).id));
    expect(ids.size).toBeGreaterThan(1);
  });

  test('answerFor returns the scripted answer, or the demo note for free text', () => {
    const s = scenarioById('bugday-pas')!;
    expect(answerFor(s, 'İlaçlama yapmam gerekiyor mu?')).toMatch(/ziraat mühendisiyle/);
    expect(answerFor(s, 'merhaba')).toMatch(/^Bu bir demo/);
  });

  test('successTone matches the website gauge colours', () => {
    expect(successTone(48)).toBe('destructive');
    expect(successTone(72)).toBe('gold');
    expect(successTone(91)).toBe('primary');
  });
});
