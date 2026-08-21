/**
 * SuperMemo SM-2 spaced-repetition scheduler. Pure functions only — no DB
 * access here, so this can be unit tested and reused identically from both
 * the review API route and (if ever needed) a script. See plan.md §3 for
 * the full design rationale.
 *
 * `grade` is 0-5:
 *   0-2 = forgot / wrong answer  → resets repetitions
 *   3   = correct but hard
 *   4   = correct, normal
 *   5   = correct, very easy
 */

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

/**
 * @param {{ repetitions: number, easeFactor: number, interval: number }} state
 * @param {number} grade 0-5
 * @returns {{ repetitions: number, easeFactor: number, interval: number }}
 */
export function sm2(state, grade) {
  if (!Number.isInteger(grade) || grade < 0 || grade > 5) {
    throw new Error(`sm2: grade must be an integer 0-5, got ${grade}`);
  }

  let { repetitions, easeFactor, interval } = state;

  if (grade >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (easeFactor < MIN_EASE_FACTOR) easeFactor = MIN_EASE_FACTOR;

  return { repetitions, easeFactor, interval };
}

/** Fresh SM-2 state for a card the user has never reviewed. */
export function initialState() {
  return { repetitions: 0, easeFactor: DEFAULT_EASE_FACTOR, interval: 0 };
}

/** `status` (FlashcardStatus) derived from repetitions/lapses — display-only. */
export function deriveStatus({ repetitions, interval, lapses }) {
  if (repetitions === 0 && lapses === 0) return "NEW";
  if (lapses > 0 && repetitions < 2) return "RELEARNING";
  if (interval < 21) return "LEARNING";
  return "REVIEW";
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Applies one review: computes the new SM-2 state from `prev` (an existing
 * FlashcardReview row shape, or null for a brand-new card) and returns the
 * fields ready to persist via `prisma.flashcardReview.upsert`.
 *
 * @param {{ repetitions:number, easeFactor:number, interval:number, lapses:number } | null} prev
 * @param {number} grade 0-5
 * @param {Date} [now]
 */
export function applyReview(prev, grade, now = new Date()) {
  const base = prev ?? initialState();
  const next = sm2(base, grade);
  const lapses = (prev?.lapses ?? 0) + (grade < 3 ? 1 : 0);

  return {
    repetitions: next.repetitions,
    easeFactor: next.easeFactor,
    interval: next.interval,
    lapses,
    status: deriveStatus({ repetitions: next.repetitions, interval: next.interval, lapses }),
    lastReviewedAt: now,
    nextReviewAt: addDays(now, next.interval),
  };
}
