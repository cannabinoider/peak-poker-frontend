import assert from "node:assert/strict";
import { it } from "node:test";

import { cardList } from "./card.ts";
import {
  bestSplit,
  boardHands,
  isValidSplit,
  splitAssignments,
} from "./multi-board.ts";

it("split options", () => {
  assert.equal(splitAssignments(4, 2).length, 14);
  assert.equal(splitAssignments(6, 3, [2, 2, 2]).length, 90);
  assert.equal(isValidSplit([0, 0, 0, 0], 2), false);
  assert.equal(isValidSplit([0, 1, 1, 1], 2), true);
  assert.equal(isValidSplit([0, 0, 1, 1, 2, 1], 3, [2, 2, 2]), false);
});

it("best split puts each pair on the board it fills up", () => {
  const hole = cardList("As Ah Kc Kd");
  const boards = [cardList("Ac 8d 2h 3s 4c"), cardList("Ks 9d Th 5s 6c")];
  const split = bestSplit(hole, boards, [null, null]);
  const hands = boardHands(hole, split, boards, [null, null]);
  assert.equal(hands[0].category, "trips");
  assert.equal(hands[1].category, "trips");
  assert.deepEqual(split, [0, 0, 1, 1]);
});

it("each board's wild is poison on the other", () => {
  const hole = cardList("7c 2d");
  const boards = [cardList("7s Kd Kh 9c 4d"), cardList("2s Qd Qh 9h 3c")];
  // Board 1 wild = 2, board 2 wild = 7.
  // Board 1's wild is 2, board 2's is 7: each wild is dead on the other board.
  const wilds = [2, 7];
  const swapped = boardHands(hole, [1, 0], boards, wilds);
  assert.equal(swapped[0].category, "trips"); // wild 2d + K K (7s is dead)
  assert.equal(swapped[1].category, "trips"); // wild 7c + Q Q (2s is dead)
  const straight = boardHands(hole, [0, 1], boards, wilds);
  assert.equal(straight[0].category, "pair"); // 7c and 7s are dead here
  assert.deepEqual(bestSplit(hole, boards, wilds), [1, 0]);
});
