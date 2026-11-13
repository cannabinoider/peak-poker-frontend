import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { Room } from "./types.ts";
import { canManage, ledgerLines, sortedResults, totalPaid, yourName } from "./utils.ts";

const setup: Room["setup"] = {
  presetId: "custom",
  buyInRupees: 100,
  chips: [
    { value: 100, count: 2 },
    { value: 25, count: 4 },
  ],
  smallBlind: 25,
  bigBlind: 50,
  dealersChoice: false,
  games: ["holdem"],
  defaultGame: "holdem",
  defaultBetting: "noLimit",
  turnSeconds: 0,
  rebuyRule: "approve",
  playOrbit: false,
  customGames: [],
};

const seat = (n: number, extra: Partial<Room["seats"][number]> = {}) => ({
  seat: n,
  name: `P${n}`,
  stack: 0,
  connected: true,
  isOwner: false,
  isBanker: false,
  animal: "fox",
  sittingOut: false,
  ...extra,
});

describe("ledger", () => {
  it("values chips exactly and sorts by seat", () => {
    const lines = ledgerLines({
      setup,
      ledger: [
        { seat: 2, name: "B", buyIns: 2, chips: 100 },
        { seat: 0, name: "A", buyIns: 1, chips: 425 },
      ],
    });
    assert.deepEqual(
      lines.map((l) => [l.name, l.paid, l.value, l.net]),
      [
        ["A", 100, 141.66666666666666, 41.66666666666666],
        ["B", 200, 33.333333333333336, -166.66666666666666],
      ],
    );
    assert.equal(totalPaid(lines), 300);
  });

  it("lets the owner or banker manage", () => {
    const seats = [seat(0, { isOwner: true }), seat(1, { isBanker: true }), seat(2)];
    assert.equal(canManage({ seats, yourSeat: 0 }), true);
    assert.equal(canManage({ seats, yourSeat: 1 }), true);
    assert.equal(canManage({ seats, yourSeat: 2 }), false);
    assert.equal(canManage({ seats, yourSeat: null }), false);
    assert.equal(yourName({ seats, yourSeat: 2 }), "P2");
  });

  it("orders settlement results by net", () => {
    const p = (name: string, net: number) => ({
      name,
      net,
      buyIns: 1,
      chips: 0,
      paidRupees: 100,
      chipValue: 0,
    });
    const sorted = sortedResults({
      players: [p("a", -50), p("b", 80), p("c", -30)],
      transfers: [],
    });
    assert.deepEqual(
      sorted.map((x) => x.name),
      ["b", "c", "a"],
    );
  });
});
