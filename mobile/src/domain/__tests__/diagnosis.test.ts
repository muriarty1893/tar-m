import { DIAGNOSES, SAMPLE_PHOTOS, diagnose } from '../diagnosis';

describe('diagnose', () => {
  test('a sample photo always gives its own result', () => {
    const sample = SAMPLE_PHOTOS.find((s) => s.id === 'domates-mildiyo')!;
    const r = diagnose({ crop: 'domates', sampleId: sample.id });
    expect(r.diagnosisId).toBe('domates-mildiyo');
    expect(r.confidence).toBe(sample.confidence);
  });

  test('a camera photo gives a result for the chosen crop, the same one for the same photo', () => {
    const a = diagnose({ crop: 'bugday', photoKey: 'file:///photo-1.jpg' });
    const b = diagnose({ crop: 'bugday', photoKey: 'file:///photo-1.jpg' });
    expect(a).toEqual(b);
    expect(['sari-pas', 'saglikli']).toContain(a.diagnosisId);
    expect(a.confidence).toBeGreaterThanOrEqual(0.72);
    expect(a.confidence).toBeLessThanOrEqual(0.95);
  });

  test('every crop can come out healthy or diseased across photos', () => {
    const ids = new Set(Array.from({ length: 12 }, (_, i) => diagnose({ crop: 'domates', photoKey: `p${i}` }).diagnosisId));
    expect(ids.has('saglikli')).toBe(true);
    expect(ids.has('domates-mildiyo')).toBe(true);
  });

  test('every diagnosis has Turkish steps, and diseases have both a chemical and an organic option', () => {
    for (const d of Object.values(DIAGNOSES)) {
      expect(d.steps.length).toBeGreaterThan(0);
      if (d.severity !== 'yok') {
        expect(d.steps.some((s) => s.kind === 'kimyasal')).toBe(true);
        expect(d.steps.some((s) => s.kind === 'organik')).toBe(true);
      }
    }
  });
});
