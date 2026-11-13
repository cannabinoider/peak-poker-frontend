import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildCustomGame,
  customGameId,
  DEFAULT_BUILDER_CHOICES as D,
  deckFitNote,
  describeGame,
  exactOptions,
  uniqueGameId,
} from "./custom-game.ts";
import { definitionErrors } from "./variant.ts";

describe("custom game builder", () => {
  it("makes ids from the name", () => {
    assert.equal(customGameId("Monster Omaha"), "c_monster_omaha");
    assert.equal(customGameId("  "), "c_game");
    assert.equal(uniqueGameId("c_x", ["c_x", "c_x_2"]), "c_x_3");
    assert.equal(uniqueGameId("c_y", ["c_x"]), "c_y");
  });

  it("builds a single-board game", () => {
    const g = buildCustomGame({
      ...D,
      name: " Big 3 ",
      exact: 2,
      special: "wild",
      specialStreet: 2,
    });
    assert.equal(g.id, "c_big_3");
    assert.equal(g.name, "Big 3");
    assert.equal(g.holeCards, 3);
    assert.deepEqual(g.boardStreets, [3, 1, 1]);
    assert.deepEqual(g.handRule, { exactHoleCards: 2 });
    assert.equal(g.special, "wild");
    assert.equal(g.boardWilds, false);
    assert.deepEqual(definitionErrors(g), []);
    assert.equal(
      describeGame(g),
      "Everyone gets 3 cards. 5 community cards. Use exactly 2 of your cards + 3 from " +
        "the board. Wild card opens with the turn.",
    );
  });

  it("builds a multi-board game with an even split", () => {
    const g = buildCustomGame({
      ...D,
      name: "Rows",
      dealt: 7,
      discard: true,
      boards: 3,
      evenSplit: true,
      exact: 2,
      special: "poison",
      twoCardRiver: true,
    });
    assert.deepEqual(g.fixedSplit, [2, 2, 2]);
    assert.deepEqual(g.handRule, { exactHoleCards: null });
    assert.equal(g.special, "none");
    assert.equal(g.boardWilds, true);
    assert.equal(g.discardStreet, 1);
    assert.equal(
      describeGame(g),
      "Everyone gets 7 cards and throws one away after the flop. 3 rows of 6 community " +
        "cards, each with its own wild card (poison on the other rows). Split your cards " +
        "2-2-2 between the rows; pots are shared by row.",
    );
    assert.deepEqual(deckFitNote(g), {
      fitsFullTable: false,
      text: "One deck fits up to 4 players.",
    });
  });

  it("drops an uneven split", () => {
    const g = buildCustomGame({
      ...D,
      name: "X",
      dealt: 3,
      boards: 2,
      evenSplit: true,
    });
    assert.equal(g.fixedSplit, null);
  });

  it("offers exact counts up to min(4, kept)", () => {
    assert.deepEqual(exactOptions({ ...D, dealt: 3 }), [1, 2, 3]);
    assert.deepEqual(exactOptions({ ...D, dealt: 7 }), [1, 2, 3, 4]);
    assert.deepEqual(exactOptions({ ...D, dealt: 2, discard: true }), [1]);
  });

  it("needs a name", () => {
    assert.deepEqual(definitionErrors(buildCustomGame(D)), ["Give the game a name."]);
    assert.equal(deckFitNote(buildCustomGame(D)).fitsFullTable, true);
  });
});
