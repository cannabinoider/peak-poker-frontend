/*
 * Client-side hand naming for your own cards (Flutter `_BottomPanel`
 * `bestLabel` and `SplitPicker`). Display only; the server decides.
 */
import type { Hand } from "../types.ts";

import { parseEngineCards } from "./engine/card.ts";
import { bestHand, describeHand } from "./engine/evaluator.ts";
import {
  boardHands,
  bestSplit as engineBestSplit,
  isValidSplit,
} from "./engine/multi-board.ts";
import { boardWildRanks, poisonRank, wildRank } from "./marks.ts";

/** "Pair of twos, queen kicker"… for your hole cards and the board so far. */
export const bestHandLabel = (
  hand: Hand,
  hole: readonly string[] | null | undefined,
) => {
  if (!hole || hole.length === 0 || hand.boards.length > 1 || hand.board.length < 3) {
    return null;
  }
  const poison = poisonRank(hand);
  try {
    const v = bestHand(parseEngineCards(hole), parseEngineCards(hand.board), {
      exactHole: hand.exactHole,
      wildRank: wildRank(hand),
      shortDeckWheel: hand.shortDeck,
      poisonRanks: poison === null ? [] : [poison],
    });
    return describeHand(v.category, v.tiebreak);
  } catch {
    return null;
  }
};

/** The suggested split of your hole cards over the boards. */
export const suggestSplit = (hand: Hand, hole: readonly string[]) =>
  engineBestSplit(
    parseEngineCards(hole),
    hand.boards.map((b) => parseEngineCards(b)),
    boardWildRanks(hand),
    hand.fixedSplit,
  );

export const splitIsValid = (hand: Hand, split: readonly number[]) =>
  isValidSplit(split, hand.boards.length, hand.fixedSplit);

/** Hand name on each board for a split, or null if the split is not valid. */
export const splitLabels = (
  hand: Hand,
  hole: readonly string[],
  split: readonly number[],
) =>
  splitIsValid(hand, split)
    ? boardHands(
        parseEngineCards(hole),
        split,
        hand.boards.map((b) => parseEngineCards(b)),
        boardWildRanks(hand),
      ).map((v) => describeHand(v.category, v.tiebreak))
    : null;
