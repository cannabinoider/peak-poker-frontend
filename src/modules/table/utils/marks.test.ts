import assert from "node:assert/strict";
import { it } from "node:test";

import { boardMark, boardWildRanks, markFor, poisonRank, wildRank } from "./marks.ts";
import { handView } from "./test-fixtures.ts";

it("marks the wild rank once the special card is open", () => {
  const closed = handView({ special: "wild" });
  assert.equal(wildRank(closed), null);
  const open = handView({ special: "wild", specialCard: "7h" });
  assert.equal(wildRank(open), 7);
  assert.equal(markFor(open, "7c"), "wild");
  assert.equal(markFor(open, "8c"), "none");
});

it("marks the poison rank", () => {
  const h = handView({ special: "poison", specialCard: "Kd" });
  assert.equal(poisonRank(h), 13);
  assert.equal(markFor(h, "Ks"), "poison");
});

it("multi-board: wild on its board, poison on the others", () => {
  const h = handView({ boards: [[], []], boardWilds: ["5c"] });
  assert.deepEqual(boardWildRanks(h), [5, null]);
  assert.equal(markFor(h, "5d"), "none");
  const wilds = [5, 9];
  assert.equal(boardMark(wilds, 0, "5d"), "wild");
  assert.equal(boardMark(wilds, 1, "5d"), "poison");
  assert.equal(boardMark(wilds, 1, "9d"), "wild");
  assert.equal(boardMark(wilds, 0, "2d"), "none");
});
