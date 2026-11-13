import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { RoomSetup } from "../types.ts";

import {
  betUnit,
  bigBlindsDeep,
  rs300,
  rs50,
  rupeesFor,
  startingStack,
  suggestedBlinds,
  turnLabel,
  validateSetup,
} from "./game-setup.ts";
import { CATALOG_IDS, variant } from "./variant.ts";

const setup = (changes: Partial<RoomSetup> = {}): RoomSetup => ({
  ...rs300(),
  dealersChoice: true,
  games: [...CATALOG_IDS],
  defaultGame: "holdem",
  defaultBetting: "noLimit",
  turnSeconds: 40,
  rebuyRule: "approve",
  playOrbit: false,
  customGames: [],
  ...changes,
});

describe("presets", () => {
  it("₹300 is 1,500 chips at 25/50 (or 25/25)", () => {
    const s = rs300();
    assert.equal(startingStack(s.chips), 1500);
    assert.equal(betUnit(s.chips), 25);
    assert.deepEqual([s.smallBlind, s.bigBlind], [25, 50]);
    assert.equal(rs300(true).bigBlind, 25);
    assert.equal(rupeesFor(s, 25), 5);
    assert.equal(bigBlindsDeep(s), 30);
  });

  it("₹50 is 400 chips at 5/10 (or 5/5)", () => {
    const s = rs50();
    assert.equal(startingStack(s.chips), 400);
    assert.deepEqual([s.smallBlind, s.bigBlind], [5, 10]);
    assert.equal(rs50(true).bigBlind, 5);
    assert.equal(rupeesFor(s, 1), 0.125);
  });

  it("suggests blinds from the smallest chip", () => {
    assert.deepEqual(
      suggestedBlinds([
        { value: 50, count: 1 },
        { value: 10, count: 2 },
      ]),
      [
        [10, 20],
        [10, 10],
      ],
    );
    assert.deepEqual(suggestedBlinds([]), []);
    assert.deepEqual(suggestedBlinds([{ value: 0, count: 1 }]), []);
  });

  it("labels turn times", () => {
    assert.equal(turnLabel(40), "40s");
    assert.equal(turnLabel(0), "No limit");
  });
});

describe("validateSetup", () => {
  it("accepts the presets", () => {
    assert.deepEqual(validateSetup(setup()), { errors: [], warnings: [] });
  });

  it("warns when the stack is shallow or deep", () => {
    const shallow = validateSetup(setup(rs50(true)));
    assert.deepEqual(shallow.errors, []);
    assert.deepEqual(shallow.warnings, []);
    const allIn = validateSetup(
      setup({ chips: [{ value: 10, count: 10 }], smallBlind: 10, bigBlind: 10 }),
    );
    assert.deepEqual(allIn.warnings, [
      "Starting stack is only 10 big blinds — the game will be all-in heavy.",
    ]);
    const slow = validateSetup(
      setup({ chips: [{ value: 10, count: 500 }], smallBlind: 10, bigBlind: 20 }),
    );
    assert.deepEqual(slow.warnings, [
      "Starting stack is 250 big blinds — the game will be very slow.",
    ]);
  });

  it("reports chip and blind problems with the engine's messages", () => {
    const v = validateSetup(
      setup({
        presetId: "custom",
        buyInRupees: 0,
        chips: [
          { value: 25, count: 2 },
          { value: 10, count: 0 },
          { value: 25, count: 1 },
        ],
        smallBlind: 15,
        bigBlind: 5,
      }),
    );
    assert.deepEqual(v.errors, [
      "Buy-in must be more than ₹0.",
      "Chip counts must be more than 0.",
      "Each chip value can only appear once.",
      "Every chip value must be a multiple of the smallest chip (10). Not allowed: 25, 25.",
      "Small blind must be at least 10 and a multiple of 10.",
      "Big blind must be a multiple of 10.",
      "Big blind must be at least the small blind.",
    ]);
    assert.deepEqual(v.warnings, []);
  });

  it("checks the stack and empty chip sets", () => {
    assert.deepEqual(
      validateSetup(
        setup({ chips: [{ value: 10, count: 2 }], smallBlind: 10, bigBlind: 20 }),
      ).errors,
      ["Big blind must be less than the starting stack (20)."],
    );
    assert.deepEqual(
      validateSetup(setup({ chips: [], smallBlind: 0, bigBlind: 0 })).errors,
      ["Add at least one chip type."],
    );
    assert.ok(
      validateSetup(setup({ chips: [{ value: 0, count: 1 }] })).errors.includes(
        "Chip values must be more than 0.",
      ),
    );
  });

  it("checks the games", () => {
    assert.deepEqual(validateSetup(setup({ games: [] })).errors, [
      "Pick at least one game for dealer's choice.",
    ]);
    assert.deepEqual(validateSetup(setup({ games: ["omaha"] })).errors, [
      "The default game must be one of the allowed games.",
    ]);
    assert.deepEqual(validateSetup(setup({ games: ["holdem", "nope"] })).errors, [
      "Unknown game in the list.",
    ]);
    assert.deepEqual(
      validateSetup(setup({ dealersChoice: false, games: [], defaultGame: "nope" }))
        .errors,
      ["Unknown game: nope."],
    );
  });

  it("includes custom game definition errors", () => {
    const bad = variant({
      id: "c_x",
      name: "Big",
      holeCards: 9,
      boardStreets: [3, 1, 1],
    });
    const v = validateSetup(setup({ customGames: [bad], games: ["holdem", "c_x"] }));
    assert.deepEqual(v.errors, ["Big: Hole cards must be 1–7."]);
  });
});
