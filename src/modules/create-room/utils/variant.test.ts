import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CATALOG,
  CATALOG_IDS,
  definitionErrors,
  displayName,
  findGame,
  maxPlayers,
  variant,
} from "./variant.ts";

describe("catalog", () => {
  it("has the engine's games in order", () => {
    assert.deepEqual(CATALOG_IDS, [
      "holdem",
      "holdem2r",
      "omaha",
      "omaha5",
      "double",
      "triple",
      "crazypine",
      "short",
      "omahahilo",
    ]);
    assert.equal(findGame("omaha", [])?.name, "Omaha");
    assert.equal(findGame("c_x", []), null);
  });

  it("has valid definitions", () => {
    for (const v of CATALOG) {
      assert.deepEqual(definitionErrors(v), [], v.id);
    }
  });

  it("counts players per deck", () => {
    assert.equal(maxPlayers(CATALOG[0]), 23);
    assert.equal(maxPlayers(findGame("triple", [])!), 5);
    assert.equal(maxPlayers(findGame("short", [])!), 15);
  });

  it("makes display names", () => {
    assert.equal(displayName(CATALOG[0]), "Texas Hold'em");
    assert.equal(
      displayName({ ...findGame("omaha", [])!, special: "wild", specialStreet: 2 }),
      "Omaha · Wild on turn",
    );
    assert.equal(displayName(findGame("crazypine", [])!), "Crazy Pineapple · Discard");
  });
});

describe("definitionErrors", () => {
  const base = { id: "c_t", name: "T", boardStreets: [3, 1, 1] };

  it("needs a name and a sane card count", () => {
    assert.deepEqual(definitionErrors(variant({ ...base, name: " ", holeCards: 2 })), [
      "Give the game a name.",
    ]);
    assert.ok(
      definitionErrors(variant({ ...base, holeCards: 8 })).includes(
        "Hole cards must be 1–7.",
      ),
    );
  });

  it("checks the exact-hole-cards rule", () => {
    assert.deepEqual(
      definitionErrors(
        variant({ ...base, holeCards: 2, handRule: { exactHoleCards: 3 } }),
      ),
      ['"Use exactly N" must be between 1 and your hole cards (max 4).'],
    );
    assert.deepEqual(
      definitionErrors(
        variant({ ...base, holeCards: 4, boards: 2, handRule: { exactHoleCards: 2 } }),
      ),
      ["With more than one board, hands use any mix of cards."],
    );
  });

  it("checks multi-board splits and the deck", () => {
    assert.deepEqual(
      definitionErrors(
        variant({
          ...base,
          holeCards: 2,
          boards: 3,
          boardWilds: true,
          special: "wild",
        }),
      ),
      [
        "Need at least one hole card per board.",
        "Multi-board games already have a wild card per board.",
      ],
    );
    assert.deepEqual(
      definitionErrors(
        variant({
          ...base,
          holeCards: 4,
          boards: 2,
          boardWilds: true,
          fixedSplit: [1, 1],
        }),
      ),
      ["The split must use all 4 hole cards."],
    );
    assert.deepEqual(
      definitionErrors(variant({ ...base, holeCards: 2, deckMinRank: 13 })),
      ["Not enough cards in one deck for 2 players."],
    );
  });
});
