import assert from "node:assert/strict";
import { it } from "node:test";

import type { HandResult } from "../types.ts";

import { handLabel, resultLines, usedPerBoard, winningCards } from "./results.ts";
import { handView, roomView, seatView } from "./test-fixtures.ts";

const result = (over: Partial<HandResult>): HandResult => ({
  pots: [],
  wentToShowdown: true,
  shownHands: {},
  boardHands: {},
  lows: {},
  ...over,
});

it("single pot at showdown names the hand", () => {
  const r = result({
    pots: [{ amount: 300, eligibleSeats: [0, 1], shares: { "1": 300 }, byBoard: [] }],
    shownHands: {
      "1": {
        category: "flush",
        tiebreak: [14, 13],
        cards: ["Ah", "Kh"],
        description: "Flush, ace high",
      },
    },
  });
  assert.deepEqual(resultLines(roomView(), r, handView()), [
    "P1 wins 300 · Flush, ace high",
  ]);
  assert.deepEqual([...winningCards(r)], ["Ah", "Kh"]);
});

it("showdown line uses the server hand description", () => {
  const r = result({
    pots: [{ amount: 2350, eligibleSeats: [0, 1], shares: { "0": 2350 }, byBoard: [] }],
    shownHands: {
      "0": {
        category: "twoPair",
        tiebreak: [13, 5, 14],
        cards: [],
        description: "Two pair, kings and fives, ace kicker",
      },
    },
  });
  assert.deepEqual(resultLines(roomView(), r, handView()), [
    "P0 wins 2,350 · Two pair, kings and fives, ace kicker",
  ]);
});

it("two pairs: the winner line and both hands name their own rank", () => {
  // Board J♣ 4♥ 7♦ 2♠ 6♠. Host's 5♥ 4♦ pairs the four; hero's 2♦ Q♠ pairs the two.
  const r = result({
    pots: [{ amount: 100, eligibleSeats: [0, 1], shares: { "0": 100 }, byBoard: [] }],
    shownHands: {
      "0": {
        category: "pair",
        tiebreak: [4, 11, 7, 6],
        cards: ["5h", "4d"],
        description: "Pair of fours, jack kicker",
      },
      "1": {
        category: "pair",
        tiebreak: [2, 12, 11, 7],
        cards: ["2d", "Qs"],
        description: "Pair of twos, queen kicker",
      },
    },
  });
  const room = roomView({
    seats: [seatView(0, { name: "Host" }), seatView(1, { name: "hero" }), seatView(2)],
  });
  assert.equal(handLabel(r, 0), "Pair of fours, jack kicker");
  assert.equal(handLabel(r, 1), "Pair of twos, queen kicker");
  assert.deepEqual(resultLines(room, r, handView()), [
    "Host wins 100 · Pair of fours, jack kicker",
  ]);
});

it("a missing description still names the pair from the tiebreak", () => {
  const r = result({
    pots: [{ amount: 100, eligibleSeats: [0, 1], shares: { "0": 100 }, byBoard: [] }],
    shownHands: {
      "0": {
        category: "pair",
        tiebreak: [4, 11, 7, 6],
        cards: ["5h", "4d"],
        description: "",
      },
      "1": {
        category: "pair",
        tiebreak: [2, 12, 11, 7],
        cards: ["2d", "Qs"],
        description: "",
      },
    },
  });
  assert.equal(handLabel(r, 0), "Pair of fours, jack kicker");
  assert.equal(handLabel(r, 1), "Pair of twos, queen kicker");
  assert.deepEqual(resultLines(roomView(), r, handView()), [
    "P0 wins 100 · Pair of fours, jack kicker",
  ]);
});

it("side pots and splits, no label without showdown", () => {
  const r = result({
    wentToShowdown: false,
    pots: [
      {
        amount: 1000,
        eligibleSeats: [0, 1],
        shares: { "0": 500, "1": 500 },
        byBoard: [],
      },
      { amount: 200, eligibleSeats: [0], shares: { "0": 200 }, byBoard: [] },
    ],
  });
  assert.deepEqual(resultLines(roomView(), r, handView()), [
    "Main pot 1,000 split: P0 500, P1 500",
    "Side pot: P0 wins 200",
  ]);
});

it("a chopped pot names each player and their share", () => {
  const r = result({
    pots: [
      {
        amount: 500,
        eligibleSeats: [0, 1],
        shares: { "0": 250, "1": 250 },
        byBoard: [],
      },
    ],
    shownHands: {
      "0": {
        category: "pair",
        tiebreak: [4, 11, 7, 6],
        cards: [],
        description: "Pair of fours, jack kicker",
      },
      "1": {
        category: "pair",
        tiebreak: [4, 11, 7, 6],
        cards: [],
        description: "Pair of fours, jack kicker",
      },
    },
  });
  const room = roomView({
    seats: [seatView(0, { name: "Riya" }), seatView(1, { name: "Kabir" }), seatView(2)],
  });
  assert.deepEqual(resultLines(room, r, handView()), [
    "Main pot 500 split: Riya 250, Kabir 250 · Pair of fours, jack kicker",
  ]);
});

it("a chopped pot shows both hands when the phrases differ", () => {
  const r = result({
    pots: [
      {
        amount: 500,
        eligibleSeats: [0, 1],
        shares: { "0": 250, "1": 250 },
        byBoard: [],
      },
    ],
    shownHands: {
      "0": {
        category: "pair",
        tiebreak: [4, 11, 7, 6],
        cards: [],
        description: "Pair of fours, jack kicker",
      },
      "1": {
        category: "pair",
        tiebreak: [2, 12, 11, 7],
        cards: [],
        description: "Pair of twos, queen kicker",
      },
    },
  });
  const room = roomView({
    seats: [seatView(0, { name: "Riya" }), seatView(1, { name: "Kabir" }), seatView(2)],
  });
  assert.deepEqual(resultLines(room, r, handView()), [
    "Main pot 500 split: Riya 250 (Pair of fours, jack kicker), Kabir 250 (Pair of twos, queen kicker)",
  ]);
});

it("an odd chip stays with the share the server awarded", () => {
  const r = result({
    wentToShowdown: false,
    pots: [
      {
        amount: 501,
        eligibleSeats: [0, 1],
        shares: { "1": 250, "0": 251 },
        byBoard: [],
      },
    ],
  });
  const room = roomView({
    seats: [seatView(0, { name: "Riya" }), seatView(1, { name: "Kabir" }), seatView(2)],
  });
  assert.deepEqual(resultLines(room, r, handView()), [
    "Main pot 501 split: Riya 251, Kabir 250",
  ]);
});

it("main and side pots list each winner, amount, and hand", () => {
  const r = result({
    pots: [
      { amount: 800, eligibleSeats: [0, 1], shares: { "0": 800 }, byBoard: [] },
      { amount: 500, eligibleSeats: [1], shares: { "1": 500 }, byBoard: [] },
    ],
    shownHands: {
      "0": {
        category: "pair",
        tiebreak: [4, 11, 7, 6],
        cards: [],
        description: "Pair of fours, jack kicker",
      },
      "1": {
        category: "pair",
        tiebreak: [2, 12, 11, 7],
        cards: [],
        description: "Pair of twos, queen kicker",
      },
    },
  });
  const room = roomView({
    seats: [seatView(0, { name: "Riya" }), seatView(1, { name: "Kabir" }), seatView(2)],
  });
  assert.deepEqual(resultLines(room, r, handView()), [
    "Main pot: Riya wins 800 · Pair of fours, jack kicker",
    "Side pot: Kabir wins 500 · Pair of twos, queen kicker",
  ]);
});

it("one player scooping every pot still lists each pot", () => {
  const r = result({
    pots: [
      { amount: 800, eligibleSeats: [0, 1], shares: { "1": 800 }, byBoard: [] },
      { amount: 200, eligibleSeats: [1], shares: { "1": 200 }, byBoard: [] },
    ],
    shownHands: {
      "1": {
        category: "flush",
        tiebreak: [14],
        cards: [],
        description: "Flush, ace high",
      },
    },
  });
  const room = roomView({
    seats: [seatView(0), seatView(1, { name: "Asha" }), seatView(2)],
  });
  assert.deepEqual(resultLines(room, r, handView()), [
    "Main pot: Asha wins 800 · Flush, ace high",
    "Side pot: Asha wins 200 · Flush, ace high",
  ]);
});

it("numbers side pots when a hand has more than one", () => {
  const r = result({
    wentToShowdown: false,
    pots: [
      { amount: 100, eligibleSeats: [0], shares: { "0": 100 }, byBoard: [] },
      { amount: 50, eligibleSeats: [1], shares: { "1": 50 }, byBoard: [] },
      { amount: 25, eligibleSeats: [2], shares: { "2": 25 }, byBoard: [] },
    ],
  });
  assert.deepEqual(resultLines(roomView(), r, handView()), [
    "Main pot: P0 wins 100",
    "Side pot 1: P1 wins 50",
    "Side pot 2: P2 wins 25",
  ]);
});

it("hi-lo: high and low halves", () => {
  const r = result({
    pots: [
      {
        amount: 400,
        eligibleSeats: [0, 1],
        shares: { "0": 200, "1": 200 },
        byBoard: [{ "0": 200 }, { "1": 200 }],
      },
    ],
    shownHands: {
      "0": {
        category: "straight",
        tiebreak: [9],
        cards: [],
        description: "Straight, nine high",
      },
    },
    lows: { "1": [7, 5, 3, 2, 1] },
  });
  assert.deepEqual(resultLines(roomView(), r, handView({ hiLo: true })), [
    "High: P0 wins 200 · Straight, nine high",
    "Low: P1 wins 200 · 7-5-3-2-A",
  ]);
});

it("hi-lo: a chopped high lists each share", () => {
  const r = result({
    pots: [
      {
        amount: 400,
        eligibleSeats: [0, 1],
        shares: { "0": 300, "1": 100 },
        byBoard: [{ "0": 100, "1": 100 }, { "0": 200 }],
      },
    ],
    shownHands: {
      "0": {
        category: "straight",
        tiebreak: [9],
        cards: [],
        description: "Straight, nine high",
      },
      "1": {
        category: "straight",
        tiebreak: [9],
        cards: [],
        description: "Straight, nine high",
      },
    },
    lows: { "0": [8, 6, 4, 3, 2] },
  });
  assert.deepEqual(resultLines(roomView(), r, handView({ hiLo: true })), [
    "High 200 split: P0 100, P1 100 · Straight, nine high",
    "Low: P0 wins 200 · 8-6-4-3-2",
  ]);
});

it("multi-board: one line per board", () => {
  const r = result({
    pots: [
      {
        amount: 400,
        eligibleSeats: [0, 1],
        shares: { "0": 200, "1": 200 },
        byBoard: [{ "0": 200 }, { "1": 200 }],
      },
    ],
    boardHands: {
      "0": [
        {
          category: "pair",
          tiebreak: [14, 13],
          cards: ["As"],
          description: "Pair of aces, king kicker",
        },
      ],
      "1": [
        { category: "highCard", tiebreak: [], cards: [], description: "High card" },
        {
          category: "trips",
          tiebreak: [13],
          cards: ["Kd"],
          description: "Three of a kind, kings",
        },
      ],
    },
  });
  const hand = handView({ boards: [[], []] });
  assert.deepEqual(resultLines(roomView(), r, hand), [
    "Board 1: P0 wins 200 · Pair of aces, king kicker",
    "Board 2: P1 wins 200 · Three of a kind, kings",
  ]);
  const used = usedPerBoard(r);
  assert.deepEqual([...(used.get(0) ?? [])], ["As"]);
  assert.deepEqual([...(used.get(1) ?? [])], ["Kd"]);
});
