import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  actionTone,
  canAskMoreTime,
  cashOutRequestsForYou,
  cashOutState,
  chipsForCashOut,
  isDeciding,
  nameOf,
  payouts,
  rebuyRequestsForYou,
  rebuyState,
  rebuyVotesForYou,
  rupeesFor,
  seatBadge,
  seatStatus,
  startingStack,
} from "./room.ts";
import { handSeat, handView, roomView, seatView } from "./test-fixtures.ts";

describe("room helpers", () => {
  it("names seats, falling back to the seat number", () => {
    const room = roomView();
    assert.equal(nameOf(room, 1), "P1");
    assert.equal(nameOf(room, 6), "Seat 7");
  });

  it("values chips at the buy-in rate", () => {
    const { setup } = roomView();
    assert.equal(startingStack(setup), 1000);
    assert.equal(rupeesFor(setup, 500), 250);
  });

  it("more time: needs a timer, and stops once the server says it's used up", () => {
    assert.equal(canAskMoreTime(roomView(), 0), false);
    assert.equal(canAskMoreTime(roomView({ turnSecondsLeft: 10 }), 0), true);
    assert.equal(
      canAskMoreTime(roomView({ graceSecondsLeft: 3, extendedSeats: [0] }), 0),
      false,
    );
    const choosing = {
      seat: 0,
      secondsLeft: 20,
      games: [],
      defaultGame: "holdem",
      defaultBetting: "noLimit" as const,
    };
    assert.equal(canAskMoreTime(roomView({ turnSecondsLeft: 5, choosing }), 0), true);
    assert.equal(
      canAskMoreTime(roomView({ turnSecondsLeft: 5, extendedSeats: [0], choosing }), 0),
      false,
    );
  });

  it("knows when you are deciding", () => {
    const legal = {
      canFold: true,
      canCheck: true,
      callAmount: 0,
      canRaise: true,
      isOpeningBet: true,
      minRaiseTo: 10,
      maxRaiseTo: 1000,
    };
    assert.equal(isDeciding(roomView(), 0), false);
    assert.equal(isDeciding(roomView({ hand: handView({ legal }) }), 0), true);
    assert.equal(
      isDeciding(roomView({ hand: handView({ discarding: [0] }) }), 0),
      true,
    );
  });

  it("sums payouts over pots", () => {
    const m = payouts({
      pots: [
        {
          amount: 100,
          eligibleSeats: [0, 1],
          shares: { "0": 50, "1": 50 },
          byBoard: [],
        },
        { amount: 40, eligibleSeats: [0], shares: { "0": 40 }, byBoard: [] },
      ],
      wentToShowdown: true,
      shownHands: {},
      boardHands: {},
      lows: {},
    });
    assert.equal(m.get(0), 90);
    assert.equal(m.get(1), 50);
  });

  it("badges the button and blinds; the choosing dealer gets D", () => {
    const room = roomView();
    assert.equal(seatBadge(room, 0), "D");
    assert.equal(seatBadge(room, 1), "SB");
    assert.equal(seatBadge(room, 2), "BB");
  });

  it("seat status", () => {
    const room = roomView({
      seats: [seatView(0), seatView(1, { connected: false }), seatView(2), seatView(3)],
      hand: handView({
        players: [handSeat(0, { folded: true }), handSeat(2, { allIn: true })],
      }),
    });
    assert.equal(seatStatus(room, room.seats[0]), "Folded");
    assert.equal(seatStatus(room, room.seats[1]), "Away");
    assert.equal(seatStatus(room, room.seats[2]), "All-in");
    assert.equal(seatStatus(room, room.seats[3]), "Next hand");
  });

  it("action tones", () => {
    assert.equal(actionTone("Fold"), "red");
    assert.equal(actionTone("Raise 200"), "gold");
    assert.equal(actionTone("BB 10"), "blue");
    assert.equal(actionTone("Match 50"), "green");
  });

  it("rebuy offer, limit and pending", () => {
    const busted = (over = {}) =>
      roomView({
        hand: null,
        ledger: [{ seat: 0, name: "P0", buyIns: 1, chips: 0 }],
        ...over,
      });
    assert.deepEqual(rebuyState(roomView()), { kind: "none" });
    assert.deepEqual(rebuyState(busted()), { kind: "offer", chips: 1000, rupees: 500 });
    assert.deepEqual(rebuyState(busted({ pendingRebuys: [0] })), { kind: "pending" });
    const twice = busted({ ledger: [{ seat: 0, name: "P0", buyIns: 2, chips: 0 }] });
    assert.deepEqual(rebuyState(twice), { kind: "limit", noRebuys: false });
    assert.deepEqual(rebuyState(busted({ ending: true })), { kind: "ending" });
  });

  it("rebuy votes: the requester waits, the voters see them", () => {
    const vote = {
      seat: 0,
      voters: [1, 2],
      approve: 1,
      deny: 0,
      needed: 2,
      yourVote: null,
    };
    const busted = roomView({
      hand: null,
      ledger: [{ seat: 0, name: "P0", buyIns: 1, chips: 0 }],
      rebuyVotes: [vote],
    });
    assert.deepEqual(rebuyState(busted), { kind: "voting", approve: 1, needed: 2 });
    assert.deepEqual(rebuyVotesForYou(busted), [], "can't vote on your own");
    assert.deepEqual(rebuyVotesForYou({ ...busted, yourSeat: 2 }), [vote]);
    assert.deepEqual(rebuyVotesForYou({ ...busted, yourSeat: null }), []);
    assert.deepEqual(rebuyVotesForYou(roomView()), []);
    assert.deepEqual(rebuyVotesForYou(roomView({ rebuyVotes: undefined })), []);
  });

  it("rebuy requests: the owner or banker decides others', never their own", () => {
    const owner = (yourSeat: number) =>
      roomView({
        yourSeat,
        seats: [seatView(0, { isOwner: true }), seatView(1, { isBanker: true })],
        pendingRebuys: [0, 2],
      });
    assert.deepEqual(rebuyRequestsForYou(owner(0)), [2], "owner's own: banker decides");
    assert.deepEqual(rebuyRequestsForYou(owner(1)), [0, 2]);
    assert.deepEqual(rebuyRequestsForYou(owner(2)), [], "not a manager");
  });

  it("cash out: who can ask, and who may approve", () => {
    assert.deepEqual(cashOutState(roomView({ started: false })), { kind: "none" });
    assert.deepEqual(cashOutState(roomView({ settlement: undefined, ending: true })), {
      kind: "none",
    });
    assert.deepEqual(cashOutState(roomView()), {
      kind: "offer",
      chips: 1000,
      direct: false,
    });
    const host = roomView({
      seats: [seatView(0, { isOwner: true, isBanker: true, stack: 1450 })],
      hand: null,
    });
    assert.deepEqual(cashOutState(host), { kind: "offer", chips: 1450, direct: true });
    assert.deepEqual(cashOutState(roomView({ pendingCashOuts: [0] })), {
      kind: "pending",
    });
    assert.deepEqual(cashOutState(roomView({ leavingAfterHand: [0] })), {
      kind: "afterHand",
    });
    assert.deepEqual(
      cashOutState(
        roomView({
          hand: null,
          seats: [seatView(0, { stack: 0 }), seatView(1), seatView(2)],
        }),
      ),
      { kind: "none" },
    );
    assert.equal(chipsForCashOut(roomView(), 0), 1000);

    const table = (yourSeat: number) =>
      roomView({
        yourSeat,
        seats: [seatView(0, { isOwner: true }), seatView(1, { isBanker: true })],
        pendingCashOuts: [0, 1],
      });
    assert.deepEqual(cashOutRequestsForYou(table(0)), [1], "owner approves the banker");
    assert.deepEqual(cashOutRequestsForYou(table(1)), [0], "never their own");
    assert.deepEqual(cashOutRequestsForYou(table(2)), [], "not a manager");
    assert.deepEqual(
      cashOutRequestsForYou(roomView({ pendingCashOuts: undefined })),
      [],
    );
  });
});
