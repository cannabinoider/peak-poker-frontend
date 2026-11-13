/*
 * Wild / poison marking of cards in the current hand (Flutter `markFor`,
 * `_MultiBoard.mark`, `HandView.wildRank` / `poisonRank` / `boardWildRanks`).
 */
import type { CardMark } from "@/lib/components/playing-card";

import type { Hand } from "../types.ts";

import { rankOf } from "./engine/card.ts";

/** Rank that is wild this hand (single board), once the special card is open. */
export const wildRank = (hand: Hand) =>
  hand.special === "wild" && hand.specialCard ? rankOf(hand.specialCard) : null;

/** Rank that is dead this hand (single board), once the special card is open. */
export const poisonRank = (hand: Hand) =>
  hand.special === "poison" && hand.specialCard ? rankOf(hand.specialCard) : null;

/** Multi-board: wild rank per board (null until that board's wild opens). */
export const boardWildRanks = (hand: Hand): (number | null)[] =>
  hand.boards.map((_, b) =>
    b < hand.boardWilds.length ? rankOf(hand.boardWilds[b]) : null,
  );

/** Mark for a card on a single-board hand (none on multi-board hands). */
export const markFor = (hand: Hand, card: string): CardMark => {
  if (hand.boards.length > 1) {
    return "none";
  }
  const rank = rankOf(card);
  if (rank === null) {
    return "none";
  }
  if (wildRank(hand) === rank) {
    return "wild";
  }
  if (poisonRank(hand) === rank) {
    return "poison";
  }
  return "none";
};

/** Multi-board: wild on its own board, poison if another board's wild. */
export const boardMark = (
  wilds: readonly (number | null)[],
  b: number,
  card: string,
): CardMark => {
  const rank = rankOf(card);
  if (rank === null) {
    return "none";
  }
  if (wilds[b] === rank) {
    return "wild";
  }
  return wilds.some((w, o) => o !== b && w === rank) ? "poison" : "none";
};
