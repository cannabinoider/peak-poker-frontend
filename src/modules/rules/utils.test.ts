import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { Hand, Setup } from "./types.ts";
import {
  betUnit,
  gameDisplayName,
  rulesFor,
  rupeesFor,
  showsFiveOfAKind,
  startingStack,
} from "./utils.ts";

const setup: Setup = {
  presetId: "rs300",
  buyInRupees: 300,
  chips: [
    { value: 500, count: 2 },
    { value: 100, count: 3 },
    { value: 50, count: 3 },
    { value: 25, count: 2 },
  ],
  smallBlind: 25,
  bigBlind: 50,
  dealersChoice: true,
  games: ["holdem", "omaha"],
  defaultGame: "holdem",
  defaultBetting: "noLimit",
  turnSeconds: 40,
  rebuyRule: "approve",
  playOrbit: false,
  customGames: [],
};

const handWith = (over: Partial<Hand>): Hand => ({
  handNumber: 1,
  variant: "holdem",
  gameName: "Texas Hold'em",
  betting: "noLimit",
  holeCards: 2,
  boardSize: 5,
  exactHole: null,
  hasDiscard: false,
  hiLo: false,
  shortDeck: false,
  gameLabel: "Texas Hold'em",
  special: "none",
  specialStreet: 0,
  specialCard: null,
  smallBlind: 25,
  bigBlind: 50,
  betUnit: 25,
  buttonSeat: 0,
  sbSeat: 1,
  bbSeat: 2,
  street: 0,
  board: [],
  boards: [[]],
  boardWilds: [],
  splitting: [],
  fixedSplit: null,
  toActSeat: 0,
  discarding: [],
  currentBet: 50,
  pot: 75,
  players: [],
  ...over,
});

const text = (hand: Hand | null, s: Setup = setup) =>
  rulesFor(s, hand)
    .flatMap((section) => [section.title, ...section.points])
    .join("\n");

describe("rulesFor (ported from rules_test.dart)", () => {
  it("Omaha pot-limit with poison on the turn", () => {
    const t = text(
      handWith({
        variant: "omaha",
        gameName: "Omaha",
        gameLabel: "Omaha · Poison on turn",
        betting: "potLimit",
        holeCards: 4,
        boardSize: 5,
        special: "poison",
        specialStreet: 2,
        exactHole: 2,
      }),
    );
    assert.ok(t.includes("Omaha · Poison on turn · Pot Limit"));
    assert.ok(t.includes("exactly 2 of your cards and exactly 3"));
    assert.ok(t.includes("Poison card"));
    assert.ok(t.includes("with the turn"));
    assert.ok(t.includes("match at least the big blind"));
    assert.ok(t.includes("Pot Limit: you can raise at most"));
    assert.ok(!t.includes("Discard"));
  });

  it("Hold'em with discard and a 2-card river", () => {
    const t = text(
      handWith({
        variant: "holdem2r",
        gameName: "Hold'em · 2-card river",
        gameLabel: "Hold'em · 2-card river · Discard",
        betting: "noLimit",
        holeCards: 3,
        boardSize: 6,
        hasDiscard: true,
      }),
    );
    assert.ok(t.includes("the river brings 2"));
    assert.ok(t.includes("Discard: right after the flop"));
    assert.ok(t.includes("any mix"));
  });

  it("double board explains splitting and pot halves", () => {
    const t = text(
      handWith({
        variant: "double",
        gameName: "Double Board",
        gameLabel: "Double Board",
        betting: "fixedLimit",
        holeCards: 4,
        boardSize: 10,
        boards: [[], []],
      }),
    );
    assert.ok(t.includes("2 rows of 5"));
    assert.ok(t.includes("split your cards between the rows"));
    assert.ok(t.includes("in half"));
    assert.ok(t.includes("Fixed Limit: bets are fixed — 50"));
  });

  it("triple board with a fixed split says thirds", () => {
    const t = text(
      handWith({
        holeCards: 6,
        boardSize: 15,
        boards: [[], [], []],
        fixedSplit: [2, 2, 2],
      }),
    );
    assert.ok(t.includes("3 rows of 5"));
    assert.ok(t.includes("(exactly 2-2-2)"));
    assert.ok(t.includes("in thirds"));
  });

  it("wild, hi-lo and short deck twists", () => {
    const t = text(
      handWith({ special: "wild", specialStreet: 1, hiLo: true, shortDeck: true }),
    );
    assert.ok(
      t.includes("Wild card: an extra card opens beside the board with the flop"),
    );
    assert.ok(t.includes("Five of a kind is possible"));
    assert.ok(t.includes("Hi-Lo: every pot is split"));
    assert.ok(t.includes("Short Deck: only 6s to aces"));
  });

  it("between hands describes the table", () => {
    const t = text(null);
    assert.ok(t.includes("Dealer's choice: each hand the dealer picks"));
    assert.ok(t.includes("Buy-in ₹300 = 1,500 chips."));
    assert.ok(t.includes("steps of the smallest chip (25)"));
    assert.ok(t.includes("You have 40s per decision"));

    const fixed = text(null, {
      ...setup,
      dealersChoice: false,
      defaultGame: "crazypine",
      defaultBetting: "potLimit",
      turnSeconds: 0,
    });
    assert.ok(fixed.includes("Every hand is Crazy Pineapple · Discard, Pot Limit."));
    assert.ok(!fixed.includes("per decision"));
  });
});

describe("setup helpers", () => {
  it("counts chips and values them exactly", () => {
    assert.equal(startingStack(setup), 1500);
    assert.equal(betUnit(setup), 25);
    assert.equal(rupeesFor(setup, 1500), 300);
    assert.equal(rupeesFor(setup, 25), 5);
    assert.equal(rupeesFor({ ...setup, chips: [] }, 100), 0);
  });

  it("names games with their twists", () => {
    assert.equal(gameDisplayName(setup, "omaha"), "Omaha");
    assert.equal(gameDisplayName(setup, "unknown"), "Texas Hold'em");
    const custom = {
      ...setup,
      customGames: [
        {
          id: "c1",
          name: "My Omaha",
          holeCards: 4,
          boardStreets: [3, 1, 1],
          handRule: { exactHoleCards: 2 },
          ranking: "high" as const,
          betting: "noLimit" as const,
          deckMinRank: 2,
          special: "wild" as const,
          specialStreet: 2,
          discardStreet: 1,
          boards: 1,
          boardWilds: false,
          fixedSplit: null,
        },
      ],
    };
    assert.equal(gameDisplayName(custom, "c1"), "My Omaha · Discard · Wild on turn");
  });

  it("shows five of a kind only with wild cards", () => {
    assert.equal(showsFiveOfAKind(null), false);
    assert.equal(showsFiveOfAKind(handWith({})), false);
    assert.equal(showsFiveOfAKind(handWith({ special: "wild" })), true);
    assert.equal(showsFiveOfAKind(handWith({ boards: [[], []] })), true);
  });
});
