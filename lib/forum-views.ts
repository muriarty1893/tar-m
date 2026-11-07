/**
 * Forum view counts that grow by themselves, added on top of the real opens (forum_topics.view_count).
 * Nothing here is stored: the number is worked out from the topic's id, when it went up and the time,
 * so it is the same on every server and only ever grows.
 *
 * The pace is modest: a new topic gets about 30–120 on its first day, then a few a day, and an old
 * topic wakes up now and then. Views only come between 09:00 and midnight, Türkiye time, each at a
 * random five minutes of its day, so counts move at random moments.
 */

// Türkiye is UTC+3 all year (no summer time since 2016).
const TR_OFFSET_MS = 3 * 60 * 60_000;
const DAY_MS = 24 * 60 * 60_000;
const OPEN_MIN = 9 * 60;
const SLOT_MIN = 5;
/** Five-minute slots from 09:00 to midnight. */
const SLOTS = (24 * 60 - OPEN_MIN) / SLOT_MIN;
/** A first day's views for an average topic, before its pull and the day's luck. */
const FIRST_DAY = 75;
/** How fast interest fades with age in days: views ∝ 1 / (1 + age)^FADE. */
const FADE = 1.3;
/** A wake-up: from the third day on, some days bring 3–14 views within an hour. */
const WAKE_CHANCE = 0.05;
const WAKE_SLOTS = 12;

/** A 32-bit seed from a topic id (FNV-1a). */
function seedOf(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** A number in [0, 1) from a seed and up to three integers (murmur3 finaliser after each). */
function rand(seed: number, a: number, b = 0, c = 0) {
  let h = seed;
  for (const n of [a, b, c]) {
    h = Math.imul(h ^ n, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
  }
  return (h >>> 0) / 4294967296;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** The Türkiye day a moment falls on (days since 1970) and its minute of that day. */
function trDay(ms: number) {
  const t = ms + TR_OFFSET_MS;
  const day = Math.floor(t / DAY_MS);
  return { day, min: (t - day * DAY_MS) / 60_000 };
}

/** The made-up views a topic has gathered by `now`. */
export function fakeViews(id: string, createdAt: Date, now: Date): number {
  const c = createdAt.getTime();
  const t = now.getTime();
  if (!(t > c)) return 0;
  const seed = seedOf(id);
  const start = trDay(c);
  const end = trDay(t);
  // How much this topic draws people, from 0.4 to 1.6 times the average.
  const pull = 0.4 + 1.2 * rand(seed, 0);
  // On its first day a topic gets the slots that begin after it went up; today, the slots begun so far.
  const firstSlot = clamp(Math.ceil((start.min - OPEN_MIN) / SLOT_MIN), 0, SLOTS);
  const begun = clamp(Math.floor((end.min - OPEN_MIN) / SLOT_MIN) + 1, 0, SLOTS);

  let total = 0;
  for (let day = start.day; day <= end.day; day++) {
    const age = day - start.day;
    const from = age === 0 ? firstSlot : 0;
    if (from >= SLOTS) continue;
    const luck = 0.6 + 0.8 * rand(seed, day, 1);
    const mean = (FIRST_DAY * pull * luck * ((SLOTS - from) / SLOTS)) / Math.pow(1 + age, FADE);
    // Rounded up or down at random, so an old topic gets 0 or 1 on most days.
    const steady = Math.floor(mean + rand(seed, day, 2));
    const wake = age >= 2 && rand(seed, day, 3) < WAKE_CHANCE ? 3 + Math.floor(rand(seed, day, 4) * 12) : 0;
    const until = day === end.day ? begun : SLOTS;
    if (until >= SLOTS) {
      total += steady + wake;
      continue;
    }
    // The day is still going: count the views whose slot has begun.
    for (let i = 0; i < steady; i++) if (from + Math.floor(rand(seed, day, 5, i) * (SLOTS - from)) < until) total++;
    if (wake) {
      const burst = Math.floor(rand(seed, day, 6) * (SLOTS - WAKE_SLOTS));
      for (let i = 0; i < wake; i++) if (burst + Math.floor(rand(seed, day, 7, i) * WAKE_SLOTS) < until) total++;
    }
  }
  return total;
}

/**
 * What a topic shows: its real opens plus the made-up ones, and never fewer than its replies and likes
 * suggest (three views a reply, one a like): a topic with 8 replies and 3 views would look wrong.
 */
export const shownViews = (id: string, realViews: number, createdAt: Date, now: Date, replies = 0, likes = 0) =>
  Math.max(realViews + fakeViews(id, createdAt, now), replies * 3 + likes);
