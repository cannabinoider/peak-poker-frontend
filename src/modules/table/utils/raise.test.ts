import assert from "node:assert/strict";
import { it } from "node:test";

import type { Legal } from "../types.ts";

import {
  mainButtons,
  potFraction,
  raiseAction,
  type RaiseContext,
  raisePresets,
  snapRaise,
} from "./raise.ts";

const legal = (over: Partial<Legal> = {}): Legal => ({
  canFold: true,
  canCheck: false,
  callAmount: 20,
  canRaise: true,
  isOpeningBet: false,
  minRaiseTo: 40,
  maxRaiseTo: 1000,
  ...over,
});

const ctx = (
  over: Partial<Legal> = {},
  betting: RaiseContext["hand"]["betting"] = "noLimit",
) => ({
  legal: legal(over),
  hand: { betUnit: 5, pot: 30, currentBet: 20, betting, bigBlind: 10 },
  you: { stack: 990, streetBet: 10 },
});

it("snaps to the bet unit inside the legal range", () => {
  assert.equal(snapRaise(ctx(), 63), 60);
  assert.equal(snapRaise(ctx(), 3), 40);
  assert.equal(snapRaise(ctx(), 5000), 1000);
});

it("pot fractions are measured after calling", () => {
  // pot 30 + call 20 = 50; pot raise = 20 + 50 = 70.
  assert.equal(potFraction(ctx(), 1), 70);
  assert.equal(potFraction(ctx(), 0.5), 45);
});

it("presets drop repeats but keep the all-in", () => {
  const labels = raisePresets(ctx({ maxRaiseTo: 1000 })).map((p) => p.label);
  assert.deepEqual(labels, ["Min", "½ Pot", "¾ Pot", "Pot", "All-in"]);
  const tight = raisePresets(ctx({ minRaiseTo: 100, maxRaiseTo: 100 }));
  assert.deepEqual(
    tight.map((p) => p.label),
    ["Min", "Max"],
  );
});

it("main button labels", () => {
  const b = mainButtons(ctx());
  assert.equal(b.matchLabel, "Match 20");
  assert.equal(b.raiseLabel, "Raise…");
  assert.equal(b.showAllIn, true);
  assert.equal(b.allInLabel, "All-in 1,000");
  assert.equal(
    mainButtons(ctx({ canCheck: true, isOpeningBet: true })).matchLabel,
    "Check",
  );
  const fixed = mainButtons(ctx({ minRaiseTo: 40, maxRaiseTo: 40 }, "fixedLimit"));
  assert.equal(fixed.raiseLabel, "Raise 40");
  assert.equal(fixed.showAllIn, false);
});

it("your whole stack goes in as all-in", () => {
  assert.deepEqual(raiseAction(ctx(), 1000), { type: "allIn" });
  assert.deepEqual(raiseAction(ctx(), 60), { type: "raise", amount: 60 });
  assert.deepEqual(raiseAction(ctx({ isOpeningBet: true }), 60), {
    type: "bet",
    amount: 60,
  });
});
