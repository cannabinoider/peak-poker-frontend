import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { HandResult } from "../types.ts";

import { tableEvents, winnerOf } from "./sound-events.ts";
import { handSeat, handView, roomView, seatView } from "./test-fixtures.ts";

const result = (shares: Record<string, number>): HandResult => ({
  pots: [{ amount: 300, eligibleSeats: [0, 1, 2], shares, byBoard: [] }],
  wentToShowdown: true,
  shownHands: {},
  boardHands: {},
  lows: {},
});

const card = "As";

const kinds = (e: ReturnType<typeof tableEvents>) => e.sounds.map((s) => s.kind);

describe("table sound events", () => {
  it("stays quiet on the first state after joining", () => {
    const room = roomView({ hand: handView({ result: result({ 1: 300 }) }) });
    assert.deepEqual(tableEvents(null, room), { sounds: [], win: null });
  });

  it("deals a new hand", () => {
    const prev = roomView({ hand: null });
    const next = roomView({ hand: handView({ toActSeat: 1 }) });
    assert.deepEqual(kinds(tableEvents(prev, next)), ["deal"]);
  });

  it("chimes when it becomes your turn", () => {
    const prev = roomView({ hand: handView({ toActSeat: 1 }) });
    const next = roomView({ hand: handView({ toActSeat: 0 }) });
    assert.deepEqual(kinds(tableEvents(prev, next)), ["yourTurn"]);
    const spectator = (r: typeof prev) => ({ ...r, yourSeat: null });
    assert.deepEqual(kinds(tableEvents(spectator(prev), spectator(next))), []);
  });

  it("chimes when you get to pick the game", () => {
    const choosing = {
      seat: 0,
      secondsLeft: 20,
      games: [],
      defaultGame: "holdem",
      defaultBetting: "noLimit" as const,
    };
    const prev = roomView({ hand: null });
    const next = roomView({ hand: null, choosing });
    assert.deepEqual(kinds(tableEvents(prev, next)), ["yourTurn"]);
  });

  it("plays chips for a call, more for a raise, a pile for an all-in", () => {
    const prev = roomView({ hand: handView({ pot: 15 }) });
    const chips = (lastAction: string, allIn = false) => {
      const next = roomView({
        hand: handView({
          pot: 115,
          players: [handSeat(0), handSeat(1, { lastAction, allIn }), handSeat(2)],
        }),
      });
      return tableEvents(prev, next).sounds;
    };
    assert.deepEqual(chips("Match 10"), [{ kind: "chips", count: 4 }]);
    assert.deepEqual(chips("Raise to 100"), [{ kind: "chips", count: 6 }]);
    assert.deepEqual(chips("All-in", true), [{ kind: "chips", count: 10 }]);
  });

  it("taps for a check, including the one that closes the street", () => {
    const prev = roomView({ hand: handView({ pot: 30, street: 1 }) });
    const checked = roomView({
      hand: handView({
        pot: 30,
        street: 1,
        players: [handSeat(0), handSeat(1, { lastAction: "Check" }), handSeat(2)],
      }),
    });
    assert.deepEqual(kinds(tableEvents(prev, checked)), ["check"]);

    const turn = roomView({
      hand: handView({ pot: 30, street: 2, boards: [[card, card, card, card]] }),
    });
    const flop = roomView({
      hand: handView({ pot: 30, street: 1, boards: [[card, card, card]] }),
    });
    assert.deepEqual(tableEvents(flop, turn).sounds, [
      { kind: "check" },
      { kind: "cards", count: 1 },
    ]);
  });

  it("swishes a fold without a check tap, even when it ends the hand", () => {
    const prev = roomView({ hand: handView({ pot: 30 }) });
    const next = roomView({
      hand: handView({
        pot: 30,
        players: [handSeat(0), handSeat(1, { folded: true }), handSeat(2)],
        result: result({ 2: 30 }),
      }),
    });
    const events = tableEvents(prev, next);
    assert.deepEqual(kinds(events), ["fold"]);
    assert.equal(events.win?.seat, 2);
  });

  it("flicks a card when someone discards", () => {
    const prev = roomView({ hand: handView({ discarding: [1, 2] }) });
    const next = roomView({ hand: handView({ discarding: [2] }) });
    assert.deepEqual(tableEvents(prev, next).sounds, [{ kind: "cards", count: 1 }]);
  });

  it("celebrates the only winner once per hand", () => {
    const seats = [
      seatView(0),
      seatView(1, { animal: "owl", name: "Asha" }),
      seatView(2),
    ];
    const prev = roomView({ seats, hand: handView() });
    const next = roomView({
      seats,
      hand: handView({ result: result({ 1: 300 }) }),
    });
    assert.deepEqual(tableEvents(prev, next).win, {
      key: "ABCD:1",
      seat: 1,
      name: "Asha",
      animal: "owl",
      amount: 300,
      you: false,
    });
    assert.equal(tableEvents(next, next).win, null);
  });

  it("does not celebrate a chopped pot", () => {
    const prev = roomView({ hand: handView() });
    const next = roomView({
      hand: handView({ result: result({ 0: 250, 1: 250 }) }),
    });
    assert.equal(tableEvents(prev, next).win, null);
    assert.equal(winnerOf(next), null);
  });

  it("does not celebrate the bigger share of a split", () => {
    const next = roomView({
      hand: handView({ result: result({ 1: 200, 2: 100 }) }),
    });
    assert.equal(winnerOf(next), null);
  });

  it("does not celebrate when different players win the pots", () => {
    const hand = handView({
      result: {
        wentToShowdown: true,
        shownHands: {},
        boardHands: {},
        lows: {},
        pots: [
          { amount: 800, eligibleSeats: [0, 1], shares: { "0": 800 }, byBoard: [] },
          { amount: 500, eligibleSeats: [1], shares: { "1": 500 }, byBoard: [] },
        ],
      },
    });
    const prev = roomView({ hand: handView() });
    const next = roomView({ hand });
    assert.equal(tableEvents(prev, next).win, null);
  });

  it("celebrates a player who scoops every pot", () => {
    const seats = [
      seatView(0),
      seatView(1, { animal: "owl", name: "Asha" }),
      seatView(2),
    ];
    const next = roomView({
      seats,
      hand: handView({
        result: {
          wentToShowdown: true,
          shownHands: {},
          boardHands: {},
          lows: {},
          pots: [
            { amount: 800, eligibleSeats: [0, 1], shares: { "1": 800 }, byBoard: [] },
            { amount: 200, eligibleSeats: [1], shares: { "1": 200 }, byBoard: [] },
          ],
        },
      }),
    });
    const win = winnerOf(next);
    assert.equal(win?.seat, 1);
    assert.equal(win?.name, "Asha");
    assert.equal(win?.animal, "owl");
    assert.equal(win?.amount, 1000);
    assert.equal(tableEvents(roomView({ seats, hand: handView() }), next).win?.seat, 1);
  });

  it("marks your own win", () => {
    const room = roomView({ hand: handView({ result: result({ 0: 300 }) }) });
    assert.equal(winnerOf(room)?.seat, 0);
    assert.equal(winnerOf(room)?.you, true);
    assert.equal(winnerOf(room)?.amount, 300);
  });
});
