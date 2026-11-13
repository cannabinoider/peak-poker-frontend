import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { cardCode, cardList, parseEngineCard } from "./card.ts";
import {
  bestHand,
  type BestHandOptions,
  combinations,
  evaluateCards,
  type HandValue,
  lowLabel,
} from "./evaluator.ts";

const five = (s: string): HandValue => evaluateCards(cardList(s));
const best = (hole: string, board: string, options: BestHandOptions = {}) =>
  bestHand(cardList(hole), cardList(board), options);

describe("cards", () => {
  it("parses and prints", () => {
    assert.equal(cardCode(parseEngineCard("As")!), "As");
    assert.equal(parseEngineCard("10h")?.rank, 10);
    assert.equal(parseEngineCard("Xx"), null);
    assert.equal(parseEngineCard("1s"), null);
  });
});

describe("categories", () => {
  const cases: [string, HandValue["category"]][] = [
    ["As Ks Qs Js Ts", "straightFlush"],
    ["9h 9d 9s 9c 2d", "quads"],
    ["3h 3d 3s 7c 7d", "fullHouse"],
    ["2h 7h 9h Jh Kh", "flush"],
    ["5d 6h 7s 8c 9d", "straight"],
    ["Qd Qh Qs 2c 9d", "trips"],
    ["Jd Jh 4s 4c Ad", "twoPair"],
    ["Td Th 4s 8c Ad", "pair"],
    ["2d 5h 9s Jc Kd", "highCard"],
  ];
  for (const [hand, cat] of cases) {
    it(`${hand} is ${cat}`, () => assert.equal(five(hand).category, cat));
  }
  it("ranks in order", () => {
    const values = cases.map(([h]) => five(h));
    for (let i = 0; i < values.length - 1; i++) {
      assert.ok(values[i].score > values[i + 1].score);
    }
  });
  it("wheel is a 5-high straight; short-deck wheel only when enabled", () => {
    assert.equal(five("As 2d 3h 4c 5s").tiebreak[0], 5);
    assert.equal(evaluateCards(cardList("As 6d 7h 8c 9s")).category, "highCard");
    assert.equal(evaluateCards(cardList("As 6d 7h 8c 9s"), true).category, "straight");
  });
});

describe("best hand", () => {
  it("finds full house over board flush", () => {
    assert.equal(best("7h 7d", "7s Kh Kc 2h 9h").category, "fullHouse");
  });
  it("Omaha exact-2: one heart in hand makes no flush", () => {
    const board = "2h 5h 8h 9h 3c";
    assert.notEqual(best("Ah Kc Qd Js", board, { exactHole: 2 }).category, "flush");
    assert.equal(best("Ah Kc Qd Js", board).category, "flush");
  });
  it("works with a partial board (flop)", () => {
    assert.equal(best("Ah Ad", "As 7c 2d").category, "trips");
  });
  it("wild cards", () => {
    assert.equal(best("9c Kd", "Ks Jh 7d 2c 4s", { wildRank: 9 }).category, "trips");
    const fiveK = best("5c 5d", "5s 5h Ad 2c 9s", { wildRank: 5 });
    assert.equal(fiveK.category, "fiveOfAKind");
    assert.equal(
      best("8h 2c", "Jh Th 9h 4d 3s", { wildRank: 2 }).category,
      "straightFlush",
    );
  });
  it("poison cards are dead", () => {
    const v = best("Ac Ad", "Ks 7h 7d 2c 4s", { poisonRanks: [14] });
    assert.equal(v.category, "pair");
    assert.equal(v.tiebreak[0], 7);
    assert.equal(
      best("6c Jd", "6s 7h 8d 9c 2s", { poisonRanks: [6] }).category,
      "highCard",
    );
    assert.equal(
      best("Ac Ad 5h 6h", "7h 8h 9s Kc 2d", { exactHole: 2, poisonRanks: [14] })
        .category,
      "straight",
    );
  });
});

it("combinations and low labels", () => {
  assert.equal(combinations([1, 2, 3, 4, 5, 6, 7], 5).length, 21);
  assert.equal(combinations([1, 2], 3).length, 0);
  assert.equal(lowLabel([8, 6, 4, 2, 1]), "8-6-4-2-A");
});
