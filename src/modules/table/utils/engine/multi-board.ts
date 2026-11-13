/*
 * Multi-board helpers, ported from poker-backend/src/engine/multi-board.ts.
 * An assignment has one board index per hole card, e.g. [0, 1, 1, 0].
 */
import type { EngineCard } from "./card.ts";
import { bestHand, type HandValue } from "./evaluator.ts";

export const isValidSplit = (
  assignment: readonly number[],
  boards: number,
  fixed: readonly number[] | null = null,
) => {
  const counts = new Array<number>(boards).fill(0);
  for (const b of assignment) {
    if (!Number.isInteger(b) || b < 0 || b >= boards) {
      return false;
    }
    counts[b]++;
  }
  if (fixed !== null) {
    return counts.every((c, b) => c === fixed[b]);
  }
  return counts.every((c) => c >= 1);
};

/** Every valid assignment of `holeCount` cards to `boards` boards. */
export const splitAssignments = (
  holeCount: number,
  boards: number,
  fixed: readonly number[] | null = null,
): number[][] => {
  const out: number[][] = [];
  if (boards < 1) {
    return out;
  }
  const a = new Array<number>(holeCount).fill(0);
  for (;;) {
    if (isValidSplit(a, boards, fixed)) {
      out.push([...a]);
    }
    let i = holeCount - 1;
    while (i >= 0 && a[i] === boards - 1) {
      a[i] = 0;
      i--;
    }
    if (i < 0) {
      return out;
    }
    a[i]++;
  }
};

/** Hole cards a player sends to board `b`. */
export const cardsForBoard = <T>(
  hole: readonly T[],
  assignment: readonly number[],
  b: number,
) => hole.filter((_, i) => assignment[i] === b);

/** Best hand on board `b`: its own wild rank is wild, the others' are poison. */
export const boardHand = (
  cards: readonly EngineCard[],
  board: readonly EngineCard[],
  b: number,
  wildRanks: readonly (number | null)[],
): HandValue => {
  const own = b < wildRanks.length ? wildRanks[b] : null;
  const poison = new Set<number>();
  wildRanks.forEach((r, i) => {
    if (i !== b && r !== null) {
      poison.add(r);
    }
  });
  return bestHand(cards, board, { wildRank: own, poisonRanks: poison });
};

/** Hands on every board for one assignment. */
export const boardHands = (
  hole: readonly EngineCard[],
  assignment: readonly number[],
  boards: readonly (readonly EngineCard[])[],
  wildRanks: readonly (number | null)[],
) =>
  boards.map((board, b) =>
    boardHand(cardsForBoard(hole, assignment, b), board, b, wildRanks),
  );

/** The split with the strongest hands overall (sum of hand scores). */
export const bestSplit = (
  hole: readonly EngineCard[],
  boards: readonly (readonly EngineCard[])[],
  wildRanks: readonly (number | null)[],
  fixed: readonly number[] | null = null,
): number[] => {
  let best: number[] | null = null;
  let bestScore = -1;
  for (const a of splitAssignments(hole.length, boards.length, fixed)) {
    const score = boardHands(hole, a, boards, wildRanks).reduce(
      (s, v) => s + v.score,
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      best = a;
    }
  }
  return best ?? new Array<number>(hole.length).fill(0);
};
