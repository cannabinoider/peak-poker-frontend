import assert from "node:assert/strict";
import { it } from "node:test";

import type { Choosing } from "../types.ts";

import { choiceSummary, effectiveChoice, initialChoice } from "./deal-choice.ts";

const holdem = {
  id: "holdem",
  name: "Hold'em",
  holeCards: 2,
  boardStreets: [3, 1, 1],
  boards: 1,
  fixedSplit: null,
};
const double = {
  ...holdem,
  id: "double",
  name: "Double board",
  boards: 2,
  fixedSplit: [2, 2],
};
const choosing: Choosing = {
  seat: 0,
  secondsLeft: 20,
  games: [holdem, double],
  defaultGame: "missing",
  defaultBetting: "potLimit",
};

it("starts on the default game, or the first one", () => {
  assert.equal(initialChoice(choosing).game, "holdem");
  assert.equal(initialChoice({ ...choosing, defaultGame: "double" }).game, "double");
  assert.equal(initialChoice(choosing).betting, "potLimit");
});

it("drops twists the game can't have", () => {
  const c = {
    ...initialChoice(choosing),
    special: "wild" as const,
    discard: true,
    specialStreet: 5,
  };
  assert.deepEqual(effectiveChoice(c, holdem), { ...c, specialStreet: 3 });
  const d = effectiveChoice(c, double);
  assert.equal(d.special, "none");
  assert.equal(d.discard, false);
});

it("summarises the pick", () => {
  const c = {
    ...initialChoice(choosing),
    special: "wild" as const,
    specialStreet: 2,
    discard: true,
  };
  assert.equal(
    choiceSummary(c, holdem),
    "Hold'em · Discard · Wild on turn · Pot Limit",
  );
});
