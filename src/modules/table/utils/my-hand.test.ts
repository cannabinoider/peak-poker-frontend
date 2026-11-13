import assert from "node:assert/strict";
import { it } from "node:test";

import { bestHandLabel, splitIsValid, splitLabels, suggestSplit } from "./my-hand.ts";
import { handView } from "./test-fixtures.ts";

it("names your hand once the flop is out", () => {
  assert.equal(bestHandLabel(handView({ board: ["2c", "3d"] }), ["Ah", "Ad"]), null);
  assert.equal(
    bestHandLabel(handView({ board: ["As", "7c", "2d"] }), ["Ah", "Ad"]),
    "Three of a kind, aces",
  );
  assert.equal(bestHandLabel(handView({ board: ["As", "7c", "2d"] }), null), null);
});

it("names your pair rank, not just Pair", () => {
  assert.equal(
    bestHandLabel(handView({ board: ["Jc", "4h", "7d", "2s", "6s"] }), ["2d", "Qs"]),
    "Pair of twos, queen kicker",
  );
});

it("counts the wild card", () => {
  const h = handView({ board: ["As", "7c", "2d"], special: "wild", specialCard: "2h" });
  assert.equal(bestHandLabel(h, ["Ah", "Kd"]), "Three of a kind, aces");
});

it("suggests and checks a split", () => {
  const h = handView({
    boards: [
      ["Ac", "8d", "2h", "3s", "4c"],
      ["Ks", "9d", "Th", "5s", "6c"],
    ],
  });
  const hole = ["As", "Ah", "Kc", "Kd"];
  const split = suggestSplit(h, hole);
  assert.deepEqual(split, [0, 0, 1, 1]);
  assert.deepEqual(splitLabels(h, hole, split), [
    "Three of a kind, aces",
    "Three of a kind, kings",
  ]);
  assert.equal(splitIsValid(h, [0, 0, 0, 0]), false);
  assert.equal(splitLabels(h, hole, [0, 0, 0, 0]), null);
});
