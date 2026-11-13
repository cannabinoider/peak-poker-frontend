import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { SetupForm } from "../types.ts";

import { validateSetup } from "./game-setup.ts";
import {
  createRequestFromForm,
  DEFAULT_FORM,
  effectiveDefaultGame,
  parseIntOr0,
  setupFromForm,
} from "./setup-form.ts";
import { variant } from "./variant.ts";

const form = (changes: Partial<SetupForm> = {}): SetupForm => ({
  ...DEFAULT_FORM,
  ...changes,
});

describe("setup form", () => {
  it("parses ints like the app", () => {
    assert.equal(parseIntOr0(" 25 "), 25);
    assert.equal(parseIntOr0("1.5"), 0);
    assert.equal(parseIntOr0("abc"), 0);
    assert.equal(parseIntOr0(""), 0);
  });

  it("defaults to a valid ₹300 dealer's choice room", () => {
    const req = createRequestFromForm(form({ roomName: "  Friday  " }));
    assert.equal(req.name, "Friday");
    assert.equal(req.setup.presetId, "rs300");
    assert.equal(req.setup.buyInRupees, 300);
    assert.equal(req.setup.games.length, 9);
    assert.equal(req.setup.turnSeconds, 40);
    assert.equal(req.setup.rebuyRule, "approve");
    assert.deepEqual(validateSetup(req.setup).errors, []);
  });

  it("builds a custom money setup sorted by chip value", () => {
    const s = setupFromForm(
      form({
        preset: "custom",
        buyIn: "100",
        chipRows: [
          { id: 1, value: "10", count: "10" },
          { id: 2, value: "100", count: "4" },
        ],
        smallBlind: "10",
        bigBlind: "20",
      }),
    );
    assert.deepEqual(s.chips, [
      { value: 100, count: 4 },
      { value: 10, count: 10 },
    ]);
    assert.equal(s.presetId, "custom");
    assert.deepEqual(validateSetup(s).errors, []);
  });

  it("keeps orbit only with dealer's choice", () => {
    assert.equal(setupFromForm(form({ playOrbit: true })).playOrbit, true);
    assert.equal(
      setupFromForm(form({ playOrbit: true, dealersChoice: false })).playOrbit,
      false,
    );
  });

  it("falls back to the first allowed default game", () => {
    const f = form({ selectedGames: ["omaha", "short"], defaultGame: "holdem" });
    assert.equal(effectiveDefaultGame(f), "omaha");
    assert.equal(effectiveDefaultGame({ ...f, dealersChoice: false }), "holdem");
  });

  it("lists custom games after the catalog", () => {
    const c = variant({
      id: "c_big",
      name: "Big",
      holeCards: 3,
      boardStreets: [3, 1, 1],
    });
    const s = setupFromForm(
      form({ customGames: [c], selectedGames: ["c_big", "holdem"] }),
    );
    assert.deepEqual(s.games, ["holdem", "c_big"]);
    assert.equal(s.customGames.length, 1);
  });
});
