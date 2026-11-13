/**
 * Seconds still left on a server timer: it said `seconds` when the state
 * arrived at `receivedAt`; it is now `now` (ms). Never negative.
 */
export const remainingSeconds = (seconds: number, receivedAt: number, now: number) =>
  Math.max(0, seconds - Math.max(0, now - receivedAt) / 1000);

/** Green while more than half is left, then gold, then red under 20%. */
export const timeTone = (fraction: number) =>
  fraction > 0.5 ? "green" : fraction > 0.2 ? "gold" : "red";

/** Fraction of `total` left, clamped to 0..1. */
export const timeFraction = (left: number, total: number) =>
  total <= 0 ? 0 : Math.min(1, Math.max(0, left / total));
