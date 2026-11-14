/**
 * Real dealing order: one card at a time, clockwise, starting with the player
 * left of the button, round after round until everyone has `holeCards` cards.
 */
export const dealOrder = (
  seats: readonly number[],
  buttonSeat: number,
  holeCards: number,
): number[] => {
  const sorted = [...seats].sort((a, b) => a - b);
  if (sorted.length === 0) {
    return [];
  }
  const firstLeft = sorted.findIndex((s) => s > buttonSeat);
  const start = firstLeft === -1 ? 0 : firstLeft;
  const round = sorted.map((_, k) => sorted[(start + k) % sorted.length]);
  const out: number[] = [];
  for (let r = 0; r < holeCards; r++) {
    out.push(...round);
  }
  return out;
};
